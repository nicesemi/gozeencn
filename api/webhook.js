/**
 * Vercel Serverless Function — Airwallex Webhook → KV 订单落库 + Resend 邮件通知
 * 部署路径: gozeen-clone/api/webhook.js
 * Webhook URL: https://gozeen.hk/api/webhook
 *
 * 前置 — Vercel 环境变量（Dashboard → Settings → Environment Variables）:
 *   RESEND_API_KEY = re_LHG7LWBt_9ZP3kaFRWRGoESiwUf4zCk3f
 *   KV_REST_API_URL / KV_REST_API_TOKEN（Vercel KV Store 连接信息）
 *
 * 前置 — Resend 域名验证（https://resend.com/domains → Add Domain → gozeen.hk）:
 *   按 Resend 提示在 gozeen.hk 的 DNS 添加 3 条 TXT 记录 (dkim + return_path + spf)
 *
 * 前置 — Airwallex Webhook 配置:
 *   URL: https://gozeen.hk/api/webhook
 *   Events: payment_intent.succeeded
 */

const { Resend } = require('resend');
const { kvGetJSON, kvSetJSON } = require('./_kv');
const { saveOrder, genOrderId } = require('./_orders');

const resend = new Resend(process.env.RESEND_API_KEY);

function money(n) {
  const v = Number(n) || 0;
  return (v / 100).toFixed(2);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    const eventType = payload.event_type || payload.type;
    const data = payload.data || {};
    const paymentIntent = data.object || data;

    // 只处理支付成功
    if (eventType !== 'payment_intent.succeeded' && eventType !== 'payment_intent.captured') {
      return res.status(200).json({ ignored: true, event: eventType });
    }

    const id = paymentIntent.id || 'N/A';
    const amount = money(paymentIntent.amount);
    const currency = paymentIntent.currency || 'USD';
    const status = paymentIntent.status || 'unknown';
    const metadata = paymentIntent.metadata || {};
    const order = paymentIntent.order || {};
    const shipping = order.shipping || {};

    // ---- 1. 订单落库（来源1：官网在线支付，幂等：payment intent id 唯一）----
    let saved = false;
    try {
      // 幂等映射：paymentIntentId -> orderId
      const mappedOrderId = await kvGetJSON(`pi2order:${id}`);
      if (mappedOrderId) {
        saved = true;
      } else {
        const products = (order.products || []).map((p) => ({
          name: p.name || p.code || '',
          code: p.code || '',
          quantity: p.quantity || 1,
          unitPrice: Number(p.unit_price || 0) / 100,
        }));
        const newOrder = {
          id: await genOrderId(),
          paymentIntentId: id,
          source: 'online',
          sourceLabel: '官网在线支付',
          products,
          customer: {
            name: [shipping.first_name, shipping.last_name].filter(Boolean).join(' ') || '',
            email: metadata.customer_email || '',
            phone: metadata.shipping_phone || '',
          },
          payment: {
            method: 'airwallex',
            amount: Number(amount),
            currency,
            status: 'paid',
            txnId: id,
          },
          shipping: {
            recipient: [shipping.first_name, shipping.last_name].filter(Boolean).join(' '),
            street: shipping.street || '',
            city: shipping.city || '',
            state: shipping.state || '',
            zip: shipping.postcode || '',
            country: shipping.country_code || '',
            phone: metadata.shipping_phone || '',
          },
          logistics: { carrier: '', trackingNo: '', status: 'unshipped', note: '' },
          status: 'new',
          serviceTracks: [],
        };
        await saveOrder(newOrder);
        await kvSetJSON(`pi2order:${id}`, newOrder.id);
        saved = true;
      }
    } catch (kvErr) {
      // KV 不可用不阻断邮件通知
      console.error('KV save error:', kvErr.message);
    }

    // ---- 2. 邮件通知 ----
    const products = (order.products || [])
      .map(p => `  - ${p.name || p.code || 'Product'} ×${p.quantity || 1}  $${money(p.unit_price)}`)
      .join('\n') || '  (No product details)';
    const shippingName = [shipping.first_name || '', shipping.last_name || ''].filter(Boolean).join(' ').trim() || 'N/A';
    const shippingAddr = [shippingName, shipping.street || ''].filter(Boolean).join(', ') || 'N/A';

    const html = `
<h2>New Order &mdash; ${id}</h2>
<table style="border-collapse:collapse;width:100%;max-width:600px;font-family:-apple-system,Arial,sans-serif;">
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;width:120px;">Payment ID</td><td style="padding:8px;">${id}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Amount</td><td style="padding:8px;font-size:18px;color:#f73437;">$${amount} ${currency}</td></tr>
  <tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">Status</td><td style="padding:8px;">${status}</td></tr>
  ${saved ? '<tr><td style="padding:8px;background:#f5f5f5;font-weight:bold;">System</td><td style="padding:8px;color:#0a7d3c;">Saved to admin</td></tr>' : ''}
</table>

<h3>Products</h3>
<pre style="font-family:-apple-system,Arial,sans-serif;background:#f9f9f9;padding:12px;border-radius:4px;">${products}</pre>

<h3>Shipping Info</h3>
<table style="border-collapse:collapse;width:100%;max-width:600px;font-family:-apple-system,Arial,sans-serif;">
  <tr><td style="padding:4px;background:#f5f5f5;width:100px;">Name</td><td style="padding:4px;">${shippingName}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">Address</td><td style="padding:4px;">${shippingAddr}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">City</td><td style="padding:4px;">${shipping.city || 'N/A'}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">Postcode</td><td style="padding:4px;">${shipping.postcode || 'N/A'}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">Country</td><td style="padding:4px;">${shipping.country_code || 'N/A'}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">Phone</td><td style="padding:4px;">${metadata.shipping_phone || 'N/A'}</td></tr>
  <tr><td style="padding:4px;background:#f5f5f5;">Email</td><td style="padding:4px;">${metadata.customer_email || 'N/A'}</td></tr>
</table>

<p style="color:#888;font-size:12px;margin-top:16px;">Sent by Zeen Order System</p>`;

    const { data: emailData, error } = await resend.emails.send({
      from: 'Zeen Orders <orders@gozeen.hk>',
      to: 'info@gozeen.hk',
      subject: `New Order: ${id} — $${amount} ${currency}`,
      html: html,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'email_failed', detail: error.message });
    }

    return res.status(200).json({ ok: true, saved, email_id: emailData?.id });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
