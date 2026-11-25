import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerSpec from './config/swagger.js'
import aiRoutes from './routes/aiRoutes.js'
import automationRoutes from './routes/automationRoutes.js'
import authRoutes from './routes/authRoutes.js'
import financeRoutes from './routes/financeRoutes.js'
import errorHandler from './middleware/errorHandler.js'
import { isOpenRouterConfigured, getOpenRouterModel } from './config/openrouter.js'
import connectDB, { isDBConnected } from './config/db.js'
import { startLoanReminderScheduler } from './services/loanReminderService.js'

// Load environment configuration
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

// 1. Security Headers via Helmet (relaxed CSP for Swagger UI)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)

// 2. CORS configuration restricted to frontend origin
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, server-to-server, postman) or matching origin
      if (!origin || origin === FRONTEND_ORIGIN) {
        callback(null, true)
      } else {
        callback(new Error(`CORS policy does not allow access from ${origin}`))
      }
    },
    methods: ['GET', 'POST', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// 3. Request body parsing with strict 10kb size limit and cookie parsing
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// 4. Swagger UI Documentation
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'SpendWise AI API Documentation',
  })
)
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(swaggerSpec)
})

// 5. Health Check Endpoint
// Does not expose environment variables, API keys, or internal configuration
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'SpendWise AI Backend',
    timestamp: new Date().toISOString(),
    dbConnected: isDBConnected(),
    aiConfigured: isOpenRouterConfigured(),
    automationConfigured: Boolean(
      process.env.SPENDWISE_N8N_WEBHOOK_URL && process.env.SPENDWISE_WEBHOOK_SECRET
    ),
  })
})

// 5. Auth Routes
app.use('/api/auth', authRoutes)

// 6. Finance Routes
app.use('/api/finance', financeRoutes)

// 7. AI Service Routes
app.use('/api/ai', aiRoutes)

// 8. Automation & Webhook Routes
app.use('/api/automation', automationRoutes)

// 9. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint ${req.method} ${req.path} not found.`,
  })
})

// 9. Central Error Handling Middleware
app.use(errorHandler)

// Connect to MongoDB and start server
connectDB()

// Start daily loan EMI reminder scheduler
try {
  startLoanReminderScheduler()
} catch (schedulerErr) {
  console.error('[SpendWise Backend] Failed to initialize loan reminder scheduler:', schedulerErr.message)
}

app.listen(PORT, () => {
  console.log(`[SpendWise Backend] Server listening securely on port ${PORT}`)
  console.log(`[SpendWise Backend] Allowed Frontend Origin: ${FRONTEND_ORIGIN}`)
  console.log(
    `[SpendWise Backend] OpenRouter Status: ${
      isOpenRouterConfigured() ? 'Configured' : 'Awaiting OPENROUTER_API_KEY in backend/.env'
    }`
  )
  console.log(
    `[SpendWise Backend] n8n Automation Status: ${
      process.env.SPENDWISE_N8N_WEBHOOK_URL && process.env.SPENDWISE_WEBHOOK_SECRET
        ? 'Configured'
        : 'Awaiting SPENDWISE_N8N_WEBHOOK_URL / SPENDWISE_WEBHOOK_SECRET in backend/.env'
    }`
  )
})

export default app
