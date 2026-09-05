/**
 * 订单存取公共模块
 * - order:<id> -> 订单 JSON
 * - orders:zset (sorted set) score=createdAt(ms) member=orderId
 * - seq:order 自增订单号
 */
const { getRedis, kvGetJSON, kvSetJSON } = require('./_kv');

function newOrderId(seq) {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `GZ-${ymd}-${String(seq).padStart(4, '0')}`;
}

async function genOrderId() {
  const r = getRedis();
  const seq = await r.incr('seq:order');
  return newOrderId(seq);
}

async function saveOrder(order) {
  const r = getRedis();
  order.updatedAt = new Date().toISOString();
  if (!order.createdAt) order.createdAt = order.updatedAt;
  const multi = r.multi();
  multi.set(`order:${order.id}`, order);
  // 用 zadd 保持按时间倒序可查
  multi.zadd('orders:zset', { score: new Date(order.createdAt).getTime(), member: order.id });
  await multi.exec();
  return order;
}

async function getOrder(id) {
  return kvGetJSON(`order:${id}`);
}

async function listOrders({ source, status, q, enteredBy, limit = 100, offset = 0 }) {
  const r = getRedis();
  // 倒序取最新
  let ids = await r.zrange('orders:zset', -limit - offset, -1 - offset);
  // zrange 默认升序，这里取末尾再反转
  ids = ids.reverse();
  const orders = [];
  for (const id of ids) {
    const o = await kvGetJSON(`order:${id}`);
    if (!o) continue;
    if (enteredBy && o.enteredBy !== enteredBy) continue;
    if (source && o.source !== source) continue;
    if (status && o.status !== status) continue;
    if (q) {
      const hay = `${o.id} ${o.customer ? o.customer.name : ''} ${o.customer ? o.customer.email : ''} ${(o.products || []).map((p) => `${p.name} ${p.code}`).join(' ')}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) continue;
    }
    orders.push(o);
  }
  return orders;
}

async function deleteOrder(id) {
  const r = getRedis();
  const multi = r.multi();
  multi.del(`order:${id}`);
  multi.zrem('orders:zset', id);
  await multi.exec();
}

async function createOrderFromWebhook(data) {
  // data: 从 Airwallex payment intent 提取的结构化订单
  const id = await genOrderId();
  const order = {
    id,
    source: 'online',
    sourceLabel: '官网在线支付',
    order: data.order || {},
    products: data.products || [],
    customer: data.customer || {},
    payment: data.payment || {},
    shipping: data.shipping || {},
    logistics: data.logistics || {},
    status: 'new',
    createdAt: data.createdAt || new Date().toISOString(),
  };
  return saveOrder(order);
}

module.exports = {
  genOrderId,
  saveOrder,
  getOrder,
  listOrders,
  deleteOrder,
  createOrderFromWebhook,
};
