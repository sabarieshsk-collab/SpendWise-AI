import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiter for authentication routes: 50 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
