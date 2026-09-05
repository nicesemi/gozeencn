/**
 * GET /api/finance?from=&to=&source=&status=  财务统计 / 对账（需登录）
 *
 * 财务口径（与银行流水一致）：
 * - 金额相关统计（总收入 / 按来源 / 按币种 / 按日 / 按月）仅统计 payment.status === 'paid' 的订单
 * - 金额按订单 payment.amount 与 payment.currency
 * - 交易流水号取 payment.txnId，缺失时用订单号代替
 * - 流水明细默认仅返回已收款记录，按日期升序；传 status 参数时按支付状态过滤
 *
 * 返回 { summary: {...}, daily: [...], monthly: [...], transactions: [...] }
 */
const { requireAuth } = require('./_auth');
const { getRedis, kvGetJSON } = require('./_kv');

const SOURCES = {
  online: '官网在线支付',
  dealer: '经销商录入',
  manual: '客服转账录入',
};

// 订单 date key（createdAt 为 ISO 字符串，取前 10 位为 UTC 日期 YYYY-MM-DD）
function dayKey(iso) { return (iso || '').slice(0, 10); }
function monthKey(iso) { return (iso || '').slice(0, 7); }

// 全量订单（财务统计需要全量，不能只取最近 100 条）
async function listAllOrders() {
  const r = getRedis();
  const ids = await r.zrange('orders:zset', 0, -1);
  const orders = [];
  for (const id of ids) {
    const o = await kvGetJSON(`order:${id}`);
    if (o) orders.push(o);
  }
  return orders;
}

function sortCurrencies(rows) {
  return rows.sort((a, b) => (a.currency < b.currency ? -1 : a.currency > b.currency ? 1 : 0));
}

module.exports = async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  // 财务统计仅 admin 可访问
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }

  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'method_not_allowed' });
    }

    const from = (req.query.from || '').trim();
    const to = (req.query.to || '').trim();
    const source = (req.query.source || '').trim() || null;
    const status = (req.query.status || '').trim() || null;

    const orders = await listAllOrders();

    // 1) 基础筛选：日期范围 + 来源（status 仅用于流水明细视图，不参与财务汇总口径）
    const filtered = orders.filter((o) => {
      if (source && o.source !== source) return false;
      const d = dayKey(o.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    // 2) 已收款子集（财务口径）
    const paid = filtered.filter((o) => o.payment && o.payment.status === 'paid');

    // 3) summary
    const currencyTotals = {};
    paid.forEach((o) => {
      const c = o.payment.currency || 'USD';
      currencyTotals[c] = (currencyTotals[c] || 0) + (Number(o.payment.amount) || 0);
    });
    const byCurrency = sortCurrencies(
      Object.keys(currencyTotals).map((c) => ({
        currency: c,
        revenue: Number(currencyTotals[c].toFixed(2)),
      }))
    );

    const sourceTotals = {};
    paid.forEach((o) => {
      const s = o.source || 'online';
      const c = o.payment.currency || 'USD';
      const key = `${s}|${c}`;
      if (!sourceTotals[key]) {
        sourceTotals[key] = {
          source: s,
          sourceLabel: SOURCES[s] || o.sourceLabel || s,
          currency: c,
          revenue: 0,
        };
      }
      sourceTotals[key].revenue += Number(o.payment.amount) || 0;
    });
    const bySource = Object.keys(sourceTotals)
      .map((k) => {
        const v = sourceTotals[k];
        v.revenue = Number(v.revenue.toFixed(2));
        return v;
      })
      .sort((a, b) => (a.sourceLabel < b.sourceLabel ? -1 : a.sourceLabel > b.sourceLabel ? 1 : 0));

    // 4) daily / monthly（基于已收款，按币种拆分，升序）
    const dailyMap = {};
    const monthlyMap = {};
    paid.forEach((o) => {
      const dk = dayKey(o.createdAt);
      const mk = monthKey(o.createdAt);
      const c = o.payment.currency || 'USD';
      const amt = Number(o.payment.amount) || 0;
      if (!dailyMap[dk]) dailyMap[dk] = {};
      dailyMap[dk][c] = (dailyMap[dk][c] || 0) + amt;
      if (!monthlyMap[mk]) monthlyMap[mk] = {};
      monthlyMap[mk][c] = (monthlyMap[mk][c] || 0) + amt;
    });
    const daily = Object.keys(dailyMap)
      .sort()
      .map((dk) => ({
        date: dk,
        rows: sortCurrencies(
          Object.keys(dailyMap[dk]).map((c) => ({ currency: c, revenue: Number(dailyMap[dk][c].toFixed(2)) }))
        ),
      }));
    const monthly = Object.keys(monthlyMap)
      .sort()
      .map((mk) => ({
        month: mk,
        rows: sortCurrencies(
          Object.keys(monthlyMap[mk]).map((c) => ({ currency: c, revenue: Number(monthlyMap[mk][c].toFixed(2)) }))
        ),
      }));

    // 5) 流水明细：默认仅已收款（与银行流水一致），传 status 则按支付状态过滤
    let txSource = paid;
    if (status) {
      txSource = filtered.filter((o) => o.payment && o.payment.status === status);
    }
    const transactions = txSource
      .map((o) => {
        const pay = o.payment || {};
        return {
          date: dayKey(o.createdAt),
          createdAt: o.createdAt,
          txnId: pay.txnId || o.id,
          orderId: o.id,
          source: o.source,
          sourceLabel: SOURCES[o.source] || o.sourceLabel || o.source,
          customer: o.customer ? o.customer.name || o.customer.email || '' : '',
          method: pay.method || '',
          currency: pay.currency || 'USD',
          amount: Number(pay.amount) || 0,
          paymentStatus: pay.status || '',
          orderStatus: o.status || '',
        };
      })
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0));

    return res.status(200).json({
      summary: {
        totalRevenue: byCurrency, // 总收入（按币种），仅已收款
        totalOrders: filtered.length,
        paidOrders: paid.length,
        cancelledOrders: filtered.filter((o) => o.status === 'cancelled').length,
        bySource,
        byCurrency,
      },
      daily,
      monthly,
      transactions,
    });
  } catch (err) {
    console.error('finance error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
