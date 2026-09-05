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
      // dealer 只能查看自己录入的订单
      if (session.role === 'dealer' && order.enteredBy !== session.username) {
        return res.status(403).json({ error: 'forbidden' });
      }
      return res.status(200).json({ order });
    }

    if (req.method === 'PUT') {
      const order = await getOrder(id);
      if (!order) return res.status(404).json({ error: 'not_found' });
      // dealer 只能修改自己录入的订单
      if (session.role === 'dealer' && order.enteredBy !== session.username) {
        return res.status(403).json({ error: 'forbidden' });
      }
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
