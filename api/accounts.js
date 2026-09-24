/**
 * 账号管理 API（仅 admin）
 *
 * GET    /api/accounts              -> 账号列表 { accounts: [...] }
 * POST   /api/accounts              -> 创建账号 { username, name, role, password }
 * PUT    /api/accounts              -> 修改账号 { username, name?, role?, password? }
 * DELETE /api/accounts?username=xx  -> 删除账号
 *
 * 约束：
 * - 角色仅允许 support（禁止创建/修改为 admin）
 * - 禁止删除 admin 账号、禁止删除自己
 * - 密码使用 _auth.js 的 hashPassword + 随机 salt 存储
 */
const { requireAuth, listAccounts, createAccount, updateAccount, deleteAccount, MANAGABLE_ROLES } = require('./_auth');
const { kvGetJSON } = require('./_kv');

function publicAccount(a) {
  return {
    username: a.username,
    name: a.name,
    role: a.role,
    createdAt: a.createdAt,
  };
}

module.exports = async function handler(req, res) {
  const session = await requireAuth(req, res);
  if (!session) return;

  // 仅 admin 可管理账号
  if (session.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }

  try {
    if (req.method === 'GET') {
      const accounts = await listAccounts();
      return res.status(200).json({ accounts });
    }

    if (req.method === 'POST') {
      const body = req.body || {};
      const username = (body.username || '').trim();
      const name = (body.name || '').trim();
      const role = (body.role || '').trim();
      const password = body.password || '';

      if (!username || !password) {
        return res.status(400).json({ error: 'username_and_password_required' });
      }
      if (!MANAGABLE_ROLES.includes(role)) {
        return res.status(400).json({ error: 'invalid_role', allowed: MANAGABLE_ROLES });
      }
      if (String(password).length < 6) {
        return res.status(400).json({ error: 'password_too_short' });
      }

      const account = await createAccount({ username, name, role, password });
      return res.status(201).json({ account: publicAccount(account) });
    }

    if (req.method === 'PUT') {
      const body = req.body || {};
      const username = (body.username || '').trim();
      const name = (body.name || '').trim();
      const role = (body.role || '').trim();
      const password = body.password || '';

      if (!username) {
        return res.status(400).json({ error: 'username_required' });
      }
      // 读取目标账号，判断角色约束
      const existing = await kvGetJSON(`acct:${username}`);
      if (!existing) {
        return res.status(404).json({ error: 'not_found' });
      }
      if (existing.role === 'admin') {
        return res.status(400).json({ error: 'cannot_modify_admin' });
      }
      if (role && !MANAGABLE_ROLES.includes(role)) {
        return res.status(400).json({ error: 'invalid_role', allowed: MANAGABLE_ROLES });
      }
      if (password && String(password).length < 6) {
        return res.status(400).json({ error: 'password_too_short' });
      }

      const account = await updateAccount(username, { name, role, password });
      return res.status(200).json({ account: publicAccount(account) });
    }

    if (req.method === 'DELETE') {
      const username = (req.query.username || '').trim();
      if (!username) {
        return res.status(400).json({ error: 'username_required' });
      }
      // 禁止删除自己
      if (username === session.username) {
        return res.status(400).json({ error: 'cannot_delete_self' });
      }
      const existing = await kvGetJSON(`acct:${username}`);
      if (!existing) {
        return res.status(404).json({ error: 'not_found' });
      }
      if (existing.role === 'admin') {
        return res.status(400).json({ error: 'cannot_delete_admin' });
      }

      await deleteAccount(username);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (err) {
    if (err.code === 'username_exists') {
      return res.status(409).json({ error: 'username_exists' });
    }
    console.error('accounts error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
