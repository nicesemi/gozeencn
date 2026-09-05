/**
 * POST /api/login
 * body: { username, password }
 * 返回: { token, username, name, role }
 */
const { verifyCredentials, createSession } = require('./_auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'missing_credentials' });
    }
    const user = await verifyCredentials(username, password);
    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' });
    }
    const token = await createSession(user);
    return res.status(200).json({ token, username: user.username, name: user.name, role: user.role });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
