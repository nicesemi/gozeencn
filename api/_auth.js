/**
 * 认证模块
 * - 账号存于 KV: acct:<username> -> { username, name, role, passwordHash, salt }
 * - 会话存于 KV: session:<token> -> { username, role, name }  TTL 24h
 * - 首次登录时若账号在环境变量中声明（ADMIN/DEALER/SUPPORT 系列），则自动创建种子账号
 */
const crypto = require('crypto');
const { getRedis, kvGetJSON, kvSetJSON, kvDelete, scanKeys } = require('./_kv');

const SESSION_TTL = 60 * 60 * 24; // 24 小时
const ITERATIONS = 120000;

// 环境变量中的种子账号定义（Vercel 面板配置）
function seedAccounts() {
  const list = [];
  const defs = [
    { username: process.env.ADMIN_USERNAME || 'admin', password: process.env.ADMIN_PASSWORD, role: 'admin', name: process.env.ADMIN_NAME || '管理员' },
    { username: process.env.DEALER_USERNAME || 'dealer', password: process.env.DEALER_PASSWORD, role: 'dealer', name: process.env.DEALER_NAME || '经销商' },
    { username: process.env.SUPPORT_USERNAME || 'support', password: process.env.SUPPORT_PASSWORD, role: 'support', name: process.env.SUPPORT_NAME || '客服' },
  ];
  for (const d of defs) {
    if (d.password) list.push(d);
  }
  return list;
}

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, 64, 'sha512').toString('hex');
}

async function ensureAccount(username) {
  // 若账号不存在，尝试从环境变量种子创建
  const existing = await kvGetJSON(`acct:${username}`);
  if (existing) return existing;
  const seed = seedAccounts().find((a) => a.username === username);
  if (!seed) return null;
  const salt = crypto.randomBytes(16).toString('hex');
  const account = {
    username,
    name: seed.name,
    role: seed.role,
    salt,
    passwordHash: hashPassword(seed.password, salt),
    createdAt: new Date().toISOString(),
  };
  await kvSetJSON(`acct:${username}`, account);
  await getRedis().sadd('accts:index', username);
  return account;
}

// ===== 账号管理（供 /api/accounts 使用）=====
// 角色白名单：仅允许创建/修改为 dealer / support；admin 仅种子账号存在，不可被账号管理接口创建或改动
const MANAGABLE_ROLES = ['dealer', 'support'];

// 列出所有可管理账号（含已物化的种子账号 dealer / support）
async function listAccounts() {
  // 主数据源：扫描 acct:* 前缀的所有 key（涵盖历史脚本直接写入、未进 accts:index 的账号）
  let keys = await scanKeys('acct:*');
  // 兜底：扫描为空时尝试物化环境变量声明的种子账号，再重扫一次
  if (!keys || keys.length === 0) {
    for (const s of seedAccounts()) {
      await ensureAccount(s.username);
    }
    keys = await scanKeys('acct:*');
  }
  const accounts = [];
  for (const key of keys || []) {
    const u = key.replace(/^acct:/, '');
    const a = await kvGetJSON(`acct:${u}`);
    if (!a) continue;
    accounts.push({
      username: a.username,
      name: a.name,
      role: a.role,
      createdAt: a.createdAt,
    });
  }
  return accounts.sort((a, b) => a.username.localeCompare(b.username));
}

// 创建账号（角色限定 MANAGABLE_ROLES，密码必须提供）
async function createAccount({ username, name, role, password }) {
  const existing = await kvGetJSON(`acct:${username}`);
  if (existing) {
    const err = new Error('username_exists');
    err.code = 'username_exists';
    throw err;
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const account = {
    username,
    name: name || username,
    role,
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };
  await kvSetJSON(`acct:${username}`, account);
  await getRedis().sadd('accts:index', username);
  return {
    username: account.username,
    name: account.name,
    role: account.role,
    createdAt: account.createdAt,
  };
}

// 修改账号（名称/角色/密码；admin 角色不可被改动）
async function updateAccount(username, { name, role, password }) {
  const existing = await kvGetJSON(`acct:${username}`);
  if (!existing) {
    const err = new Error('not_found');
    err.code = 'not_found';
    throw err;
  }
  if (existing.role === 'admin' && role && role !== 'admin') {
    const err = new Error('cannot_change_admin_role');
    err.code = 'cannot_change_admin_role';
    throw err;
  }
  if (name !== undefined && name !== null && name !== '') existing.name = name;
  if (role !== undefined && role !== null && role !== '') existing.role = role;
  if (password) {
    existing.salt = crypto.randomBytes(16).toString('hex');
    existing.passwordHash = hashPassword(password, existing.salt);
  }
  await kvSetJSON(`acct:${username}`, existing);
  return {
    username: existing.username,
    name: existing.name,
    role: existing.role,
    createdAt: existing.createdAt,
  };
}

// 删除账号（仅 dealer/support，调用方需校验不可删除 admin 与自己）
async function deleteAccount(username) {
  const r = getRedis();
  const multi = r.multi();
  multi.del(`acct:${username}`);
  multi.srem('accts:index', username);
  await multi.exec();
}

async function verifyCredentials(username, password) {
  if (!username || !password) return null;
  const account = await ensureAccount(username);
  if (!account) return null;
  const hash = hashPassword(password, account.salt);
  if (hash !== account.passwordHash) return null;
  return { username: account.username, name: account.name, role: account.role };
}

async function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = { username: user.username, name: user.name, role: user.role, createdAt: new Date().toISOString() };
  await kvSetJSON(`session:${token}`, session, SESSION_TTL);
  return token;
}

async function getSession(token) {
  if (!token) return null;
  return kvGetJSON(`session:${token}`);
}

async function destroySession(token) {
  if (!token) return;
  await kvDelete(`session:${token}`);
}

// 从 req headers 提取 token（Authorization: Bearer xxx）
function extractToken(req) {
  const h = req.headers['authorization'] || '';
  if (h.startsWith('Bearer ')) return h.slice(7);
  return null;
}

// 包装：校验登录态，失败返回 401
async function requireAuth(req, res) {
  const token = extractToken(req);
  const session = await getSession(token);
  if (!session) {
    res.status(401).json({ error: 'unauthorized' });
    return null;
  }
  return session;
}

module.exports = {
  hashPassword,
  verifyCredentials,
  createSession,
  getSession,
  destroySession,
  extractToken,
  requireAuth,
  seedAccounts,
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  MANAGABLE_ROLES,
};
