import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { testAIConnection, handleAIChat, analyzeSpending } from '../controllers/aiController.js'

const router = Router()

// Rate limiter for AI operations: max 40 requests per 15-minute window per IP
const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many AI requests from this IP. Please try again after 15 minutes.',
  },
})

// Apply rate limiter to all AI routes
router.use(aiRateLimiter)

// Route: Test OpenRouter Connectivity
router.post('/test', testAIConnection)

// Route: Live Conversational AI Financial Assistant
router.post('/chat', handleAIChat)

// Route: Live AI Spending Diagnostic Analysis
router.post('/analyze-spending', analyzeSpending)

export default router
