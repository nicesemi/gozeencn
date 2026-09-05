/**
 * Vercel KV (Upstash Redis) 封装
 * 通过环境变量 KV_REST_API_URL / KV_REST_API_TOKEN 连接
 */
const { Redis } = require('@upstash/redis');

function getRedis() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    throw new Error('KV_REST_API_URL / KV_REST_API_TOKEN 未配置');
  }
  return new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

// 读取 JSON 对象，不存在返回 null
async function kvGetJSON(key) {
  const r = await getRedis().get(key);
  return r == null ? null : r;
}

async function kvSetJSON(key, value, exSeconds) {
  const r = getRedis();
  if (exSeconds) {
    return r.set(key, value, { ex: exSeconds });
  }
  return r.set(key, value);
}

async function kvDelete(key) {
  return getRedis().del(key);
}

// 基于 SCAN 遍历匹配 pattern 的所有 key（循环直至 cursor 为 0）
async function scanKeys(pattern) {
  const r = getRedis();
  const keys = [];
  let cursor = '0';
  let guard = 0;
  do {
    const res = await r.scan(cursor, { match: pattern, count: 100 });
    cursor = String(res[0]);
    const batch = res[1] || [];
    for (const k of batch) {
      if (!keys.includes(k)) keys.push(k);
    }
    guard += 1;
    if (guard > 1000) break; // 安全阀，防止极端情况下死循环
  } while (cursor !== '0');
  return keys;
}

module.exports = { getRedis, kvGetJSON, kvSetJSON, kvDelete, scanKeys };
