/**
 * POST /api/logout
 * body: 无，需带 Authorization Bearer token
 */
const { destroySession, extractToken } = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const token = extractToken(req);
    if (token) await destroySession(token);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('logout error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
