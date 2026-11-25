import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';
import { isDBConnected } from '../config/db.js';

export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check HttpOnly cookie first, then Bearer Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No session or token found.'
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session.'
      });
    }

    if (!isDBConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently unavailable. Please verify MongoDB connection.'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this session no longer exists.'
      });
    }

    req.user = user.toSafeJSON();
    next();
  } catch (error) {
    console.error('Auth protection middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication server error.'
    });
  }
};
