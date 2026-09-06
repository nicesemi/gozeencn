/**
 * GET /api/lease-status?orderId=GZ-xxxx&phone=138xxxx  （公开接口，无需登录）
 *
 * 用户端「我的租赁」查询：
 *  - 按 订单号 + 收件/客户手机号 双重校验取回租赁状态摘要
 *  - 仅返回对用户可见的字段，不暴露后台内部信息
 *  - 手机号匹配：customer.phone 或 shipping.phone 任一命中即可
 *
 * 返回 { ok, lease: {...} } 或 { ok:false, error }
 */
const { getRedis } = require('./_kv');

function normPhone(p) {
  return String(p || '').replace(/[\s\-+]/g, '');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  try {
    const orderId = String(req.query.orderId || '').trim();
    const phone = normPhone(req.query.phone);

    if (!orderId || !phone) {
      return res.status(400).json({ error: 'orderId_and_phone_required' });
    }

    const r = getRedis();
    const order = await r.get(`order:${orderId}`);
    if (!order) {
      return res.status(404).json({ error: 'order_not_found' });
    }

    // 手机号校验（客户手机 或 收件手机）
    const custPhone = normPhone(order.customer && order.customer.phone);
    const shipPhone = normPhone(order.shipping && order.shipping.phone);
    if (phone !== custPhone && phone !== shipPhone) {
      return res.status(403).json({ error: 'phone_mismatch' });
    }

    const lease = order.lease || {};
    const payHistory = Array.isArray(lease.payHistory) ? lease.payHistory : [];
    const depositAmount = Number(lease.depositAmount != null ? lease.depositAmount : (order.payment && order.payment.amount) || 0);
    const monthlyRent = Number(lease.monthlyRent || 0);
    const termMonths = Number(lease.termMonths) || 36;
    const paidPeriods = payHistory.length;
    const paidTotal = payHistory.reduce((s, h) => s + (Number(h.amount) || 0), 0);
    const remainingDeposit = Number((depositAmount - paidTotal).toFixed(2));

    return res.status(200).json({
      ok: true,
      lease: {
        orderId: order.id,
        created: (order.createdAt || '').slice(0, 10),
        products: (order.products || []).map((p) => ({
          name: p.name,
          code: p.code,
          quantity: p.quantity,
        })),
        status: order.status,
        orderStatusLabel: { new: '新订单', processing: '处理中', shipped: '已发货', completed: '已完成', cancelled: '已取消' }[order.status] || order.status,
        depositAmount,
        monthlyRent,
        termMonths,
        startDate: lease.startDate || null,
        paidPeriods,
        paidTotal: Number(paidTotal.toFixed(2)),
        remainingDeposit: Math.max(remainingDeposit, 0),
        depositRefunded: !!lease.depositRefunded,
        refundTime: lease.refundTime || null,
        payHistory: payHistory.map((h) => ({
          period: Number(h.period) || 0,
          amount: Number(h.amount) || 0,
          paidDate: (h.paidDate || '').slice(0, 10),
          dueDate: (h.dueDate || '').slice(0, 10) || null,
          method: { bank_transfer: '银行转账', airwallex: '在线支付', other: '其他' }[h.method] || h.method || '-',
          txn: h.txn || '',
        })),
      },
    });
  } catch (err) {
    console.error('lease-status error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
