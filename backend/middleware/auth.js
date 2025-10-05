const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access forbidden: Insufficient permissions' });
    }

    next();
  };
};

const checkUserStatus = (req, res, next) => {
  if (req.user.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended. Please contact admin.' });
  }

  if (req.user.status === 'banned') {
    return res.status(403).json({ error: 'Account banned. Please contact admin.' });
  }

  if (req.user.status === 'pending') {
    return res.status(403).json({ error: 'Account pending approval.' });
  }

  next();
};

module.exports = {
  authenticateToken,
  authorizeRoles,
  checkUserStatus
};
