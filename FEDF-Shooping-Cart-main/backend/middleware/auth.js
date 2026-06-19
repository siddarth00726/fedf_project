import jwt from 'jsonwebtoken';

const verifyToken = (req) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'smartcart_secret_key');
  } catch {
    return null;
  }
};

export const authRequired = (req, res, next) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ message: 'Login required' });
  req.user = user;
  next();
};

export const adminRequired = (req, res, next) => {
  const user = verifyToken(req);
  if (!user) return res.status(401).json({ message: 'Login required' });
  if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  req.user = user;
  next();
};
