/**
 * /api/orders/:id
 * GET  -> 订单详情（需登录）
 * PUT  -> 更新订单（物流/状态/客户信息/服务追踪记录）
 * DELETE -> 删除订单（仅 admin）
 */
const { requireAuth } = require('../_auth');
const { getOrder, saveOrder, deleteOrder } = require('../_orders');

module.exports = async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    const id = (req.query.id || '').trim();
    if (!id) return res.status(400).json({ error: 'missing_id' });

    if (req.method === 'GET') {
      const order = await getOrder(id);
      if (!order) return res.status(404).json({ error: 'not_found' });
      return res.status(200).json({ order });
    }

    if (req.method === 'PUT') {
      const order = await getOrder(id);
      if (!order) return res.status(404).json({ error: 'not_found' });
      const body = req.body || {};

      // 只允许更新以下字段
      if (body.customer) order.customer = { ...order.customer, ...body.customer };
      if (body.shipping) order.shipping = { ...order.shipping, ...body.shipping };
      if (body.logistics) order.logistics = { ...order.logistics, ...body.logistics };
      if (body.payment) order.payment = { ...order.payment, ...body.payment };
      if (body.status) order.status = body.status;
      if (body.note !== undefined) order.note = body.note;
      if (body.products) order.products = body.products;

      // 服务追踪记录：追加一条 { type, content, handler, time }
      if (body.serviceTrack) {
        if (!Array.isArray(order.serviceTracks)) order.serviceTracks = [];
        order.serviceTracks.push({
          type: body.serviceTrack.type || '其他',
          content: body.serviceTrack.content || '',
          handler: session.name || session.username,
          time: new Date().toISOString(),
        });
      }

      // ---- 租赁运营动作（仅 admin，support 无权改动租赁数据）----
      if (session.role === 'admin') {
        // 1) 更新租赁基础字段（月租/租期/计租起始等，merge 语义）
        if (body.lease && typeof body.lease === 'object') {
          const cur = order.lease || {};
          const next = Object.assign({}, cur, body.lease);
          next.depositAmount = Number(next.depositAmount != null ? next.depositAmount : (order.payment && order.payment.amount) || 0);
          next.monthlyRent = Number(next.monthlyRent || 0);
          next.termMonths = Number(next.termMonths) || 36;
          next.paidPeriods = Number(cur.paidPeriods) || 0;
          if (!Array.isArray(next.payHistory)) next.payHistory = cur.payHistory || [];
          const paidTotal = next.payHistory.reduce((s, h) => s + (Number(h.amount) || 0), 0);
          next.remainingDeposit = Number((next.depositAmount - paidTotal).toFixed(2));
          if (next.remainingDeposit < 0) next.remainingDeposit = 0;
          order.lease = next;
        }

        // 2) 登记一期租金
        if (body.addRent) {
          if (!order.lease && order.type !== 'lease') {
            return res.status(400).json({ error: 'not_a_lease_order' });
          }
          const cur = order.lease || { payHistory: [], paidPeriods: 0, remainingDeposit: (order.payment && order.payment.amount) || 0, depositAmount: (order.payment && order.payment.amount) || 0 };
          if (!Array.isArray(cur.payHistory)) cur.payHistory = [];
          const period = parseInt(body.addRent.period, 10) || (cur.payHistory.length + 1);
          const amount = Number(body.addRent.amount);
          // 已退押金后不可再收租
          if (cur.depositRefunded) {
            return res.status(400).json({ error: 'deposit_already_refunded' });
          }
          if (!(amount > 0)) {
            return res.status(400).json({ error: 'rent_amount_required' });
          }
          const paidTotal = cur.payHistory.reduce((s, h) => s + (Number(h.amount) || 0), 0);
          if (paidTotal + amount > cur.depositAmount + 1e-9) {
            return res.status(400).json({ error: 'rent_exceeds_deposit', detail: `已收 ${paidTotal}，本期 ${amount}，押金 ${cur.depositAmount}` });
          }
          cur.payHistory.push({
            period,
            amount,
            dueDate: body.addRent.dueDate || body.addRent.paidDate || null,
            paidDate: body.addRent.paidDate || new Date().toISOString().slice(0, 10),
            method: body.addRent.method || 'bank_transfer',
            txn: body.addRent.txn || '',
            handler: session.name || session.username,
          });
          cur.paidPeriods = cur.payHistory.length;
          cur.remainingDeposit = Number((cur.depositAmount - (paidTotal + amount)).toFixed(2));
          if (cur.remainingDeposit < 0) cur.remainingDeposit = 0;
          order.lease = cur;
        }

        // 3) 退剩余押金（提前结束）
        if (body.refundDeposit) {
          if (!order.lease && order.type !== 'lease') {
            return res.status(400).json({ error: 'not_a_lease_order' });
          }
          const cur = order.lease || { payHistory: [], paidPeriods: 0, remainingDeposit: (order.payment && order.payment.amount) || 0, depositAmount: (order.payment && order.payment.amount) || 0 };
          if (!Array.isArray(cur.payHistory)) cur.payHistory = [];
          if (cur.depositRefunded) {
            return res.status(400).json({ error: 'deposit_already_refunded' });
          }
          const amount = Number(body.refundDeposit.amount);
          if (!(amount > 0) || amount > cur.remainingDeposit + 1e-9) {
            return res.status(400).json({ error: 'refund_amount_invalid', detail: `剩余押金 ${cur.remainingDeposit}` });
          }
          cur.depositRefunded = true;
          cur.refundTime = new Date().toISOString();
          cur.remainingDeposit = Number((cur.remainingDeposit - amount).toFixed(2));
          if (cur.remainingDeposit < 0) cur.remainingDeposit = 0;
          cur.refundRecord = {
            amount,
            reason: body.refundDeposit.reason || '',
            txn: body.refundDeposit.txn || '',
            handler: session.name || session.username,
            time: cur.refundTime,
          };
          order.lease = cur;
        }
      }

      await saveOrder(order);
      return res.status(200).json({ order });
    }

    if (req.method === 'DELETE') {
      if (session.role !== 'admin') {
        return res.status(403).json({ error: 'forbidden' });
      }
      await deleteOrder(id);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('order detail error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
