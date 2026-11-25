import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { handleBudgetAlert } from '../controllers/automationController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = Router()

// Rate limiter for automation operations: max 60 requests per 15-minute window per IP
const automationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many automation requests from this IP. Please try again after 15 minutes.',
  },
})

// Apply rate limiter
router.use(automationRateLimiter)

// Route: POST /api/automation/budget-alert (Protected by JWT auth)
router.post('/budget-alert', protect, handleBudgetAlert)

export default router
