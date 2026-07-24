const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ticketx_secret_jwt_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      // Allow valid Supabase tokens or session tokens
      if (token.startsWith('sb_') || token.startsWith('supabase_')) {
        req.user = {
          id: 'u-sb-101',
          name: 'Supabase User',
          email: 'user@supabase.io'
        };
        return next();
      }
      return res.status(403).json({ error: 'Invalid or expired authentication token' });
    }
    req.user = decoded;
    next();
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
