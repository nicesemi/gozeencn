/**
 * POST /api/orders/online — 官网前端支付成功后公开落库接口（无需登录）
 * body: {
 *   paymentIntentId: string,          // Airwallex payment intent id（幂等键）
 *   products: [{ name, code, quantity, unitPrice }],
 *   customer: { name, email, phone },
 *   shipping: { recipient, street, city, state, zip, country, phone },
 *   payment: { method, amount, currency, status, txnId },
 *   totalCents: number,
 *   sourceLabel: string               // 可选，默认 '官网在线支付'
 * }
 * 幂等：pi2order:<paymentIntentId> -> orderId，重复提交返回已存在的订单
 * 字段与 api/webhook.js 落库结构一致，后台订单列表可直接联动展示。
 */
const { kvGetJSON, kvSetJSON } = require('../_kv');
const { saveOrder, genOrderId } = require('../_orders');

const SOURCE_LABELS = {
  online: '官网在线支付',
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const paymentIntentId = String(body.paymentIntentId || '').trim();
    const products = Array.isArray(body.products) ? body.products : [];
    const customer = body.customer || {};
    const shipping = body.shipping || {};
    const payment = body.payment || {};
    const source = body.source === 'dealer' ? 'dealer' : 'online';

    // ---- 基础校验 ----
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'paymentIntentId_required' });
    }
    if (!products.length) {
      return res.status(400).json({ error: 'products_required' });
    }
    if (!shipping || !shipping.recipient) {
      return res.status(400).json({ error: 'shipping_recipient_required' });
    }
    if (!customer || !customer.email) {
      return res.status(400).json({ error: 'customer_email_required' });
    }

    // ---- 幂等：同一 payment intent 只落库一次 ----
    const mappedOrderId = await kvGetJSON(`pi2order:${paymentIntentId}`);
    if (mappedOrderId) {
      return res.status(200).json({ ok: true, id: mappedOrderId, idempotent: true });
    }

    // ---- 租赁参数：押金=实付金额，月租可前端透传，否则默认 = 押金 ÷ 36 ----
    const leaseIn = body.lease || {};
    const depositAmount = Number(body.totalCents != null ? body.totalCents / 100 : (payment.amount || 0));
    const termMonths = Number(leaseIn.termMonths) || 36;
    const monthlyRent = Number(leaseIn.monthlyRent) > 0
      ? Number(leaseIn.monthlyRent)
      : termMonths > 0 ? Number((depositAmount / termMonths).toFixed(2)) : 0;

    const newOrder = {
      id: await genOrderId(),
      paymentIntentId,
      source,
      sourceLabel: SOURCE_LABELS[source] || '官网在线支付',
      type: 'lease',
      lease: {
        depositAmount,
        monthlyRent,
        termMonths,
        startDate: null, // 计租起始日：默认发货日，由 admin 在后台确认填
        paidPeriods: 0,
        remainingDeposit: depositAmount,
        depositRefunded: false,
        refundTime: null,
        payHistory: [],
      },
      products: products.map((p) => ({
        name: String(p.name || p.title || ''),
        code: String(p.code || p.variant || ''),
        quantity: parseInt(p.quantity, 10) || 1,
        unitPrice: Number(p.unitPrice || p.price || 0),
      })),
      customer: {
        name: String(customer.name || shipping.recipient || ''),
        email: String(customer.email || ''),
        phone: String(customer.phone || shipping.phone || ''),
      },
      payment: {
        method: String(payment.method || 'airwallex'),
        amount: Number(payment.amount != null ? payment.amount : (body.totalCents || 0) / 100),
        currency: String(payment.currency || 'CNY'),
        status: String(payment.status || 'paid'),
        txnId: String(payment.txnId || paymentIntentId),
      },
      shipping: {
        recipient: String(shipping.recipient || ''),
        street: String(shipping.street || ''),
        city: String(shipping.city || ''),
        state: String(shipping.state || ''),
        zip: String(shipping.zip || shipping.postcode || ''),
        country: String(shipping.country || shipping.country_code || ''),
        phone: String(shipping.phone || customer.phone || ''),
      },
      logistics: { carrier: '', trackingNo: '', status: 'unshipped', note: '' },
      status: 'new',
      serviceTracks: [],
    };

    await saveOrder(newOrder);
    await kvSetJSON(`pi2order:${paymentIntentId}`, newOrder.id);

    return res.status(201).json({ ok: true, id: newOrder.id, idempotent: false });
  } catch (err) {
    console.error('orders/online error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
