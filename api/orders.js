/**
 * GET  /api/orders?source=&status=&q=&limit=&offset=  订单列表（需登录）
 * POST /api/orders                                   手动录入订单（客服/管理员）
 * body: { source: 'manual', products:[], customer:{}, payment:{}, shipping:{}, logistics:{} }
 */
const { requireAuth } = require('./_auth');
const { saveOrder, listOrders, genOrderId } = require('./_orders');

const SOURCES = {
  online: '官网在线支付',
  manual: '客服转账录入',
};

function normalizeManualOrder(body, user) {
  const now = new Date().toISOString();
  // 后台手动录入统一归为客服录入（manual），不再区分经销商来源
  const source = 'manual';
  const orderType = body.type === 'purchase' ? 'purchase' : 'lease';
  const paidAmount = Number((body.payment && body.payment.amount) || 0);
  // 租赁参数（押金=payment.amount，月租/租期/计租起始可前台覆盖）
  const leaseIn = body.lease || {};
  const depositAmount = orderType === 'purchase'
    ? 0
    : Number((body.payment && body.payment.amount) || leaseIn.depositAmount || 0);
  const termMonths = Number(leaseIn.termMonths) || 36;
  const monthlyRent =
    orderType === 'purchase'
      ? 0
      : Number(leaseIn.monthlyRent) > 0
        ? Number(leaseIn.monthlyRent)
        : termMonths > 0
          ? Number((depositAmount / termMonths).toFixed(2))
          : 0;
  return {
    type: orderType,
    ...(orderType === 'purchase'
      ? { purchaseAmount: paidAmount }
      : {
          lease: {
            depositAmount,
            monthlyRent,
            termMonths,
            startDate: leaseIn.startDate || null,
            paidPeriods: 0,
            remainingDeposit: depositAmount,
            depositRefunded: false,
            refundTime: null,
            payHistory: [],
          },
        }),
    source,
    sourceLabel: SOURCES[source],
    enteredBy: user ? user.username : null,
    products: (body.products || []).map((p) => ({
      name: (p.name || '').trim(),
      code: (p.code || '').trim(),
      quantity: parseInt(p.quantity, 10) || 1,
      unitPrice: parseFloat(p.unitPrice) || 0,
      kind: orderType === 'purchase' ? 'purchase' : (p.kind === 'purchase' ? 'purchase' : 'lease'),
    })),
    customer: {
      name: (body.customer && body.customer.name) || '',
      email: (body.customer && body.customer.email) || '',
      phone: (body.customer && body.customer.phone) || '',
    },
    payment: {
      method: (body.payment && body.payment.method) || '',
      amount: parseFloat(body.payment && body.payment.amount) || 0,
      currency: (body.payment && body.payment.currency) || 'CNY',
      status: (body.payment && body.payment.status) || 'paid',
      txnId: (body.payment && body.payment.txnId) || '',
    },
    shipping: {
      recipient: (body.shipping && body.shipping.recipient) || '',
      street: (body.shipping && body.shipping.street) || '',
      city: (body.shipping && body.shipping.city) || '',
      state: (body.shipping && body.shipping.state) || '',
      zip: (body.shipping && body.shipping.zip) || '',
      country: (body.shipping && body.shipping.country) || '',
      phone: (body.shipping && body.shipping.phone) || '',
    },
    logistics: {
      carrier: (body.logistics && body.logistics.carrier) || '',
      trackingNo: (body.logistics && body.logistics.trackingNo) || '',
      status: (body.logistics && body.logistics.status) || 'unshipped',
      note: (body.logistics && body.logistics.note) || '',
    },
    status: 'new',
    createdAt: now,
  };
}

module.exports = async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    if (req.method === 'GET') {
      const enteredBy = null;
      const orders = await listOrders({
        source: req.query.source || null,
        status: req.query.status || null,
        q: req.query.q || null,
        enteredBy,
        limit: parseInt(req.query.limit, 10) || 100,
        offset: parseInt(req.query.offset, 10) || 0,
      });
      return res.status(200).json({ orders, total: orders.length });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const order = normalizeManualOrder(body, session);
      if (!order.products.length) {
        return res.status(400).json({ error: 'products_required' });
      }
      order.id = await genOrderId();
      await saveOrder(order);
      return res.status(201).json({ order });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    console.error('orders error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
