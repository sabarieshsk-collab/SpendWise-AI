import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../.env') })
dotenv.config()

/**
 * Validates whether the OpenRouter API key is configured.
 * @returns {boolean}
 */
export const isOpenRouterConfigured = () => {
  const apiKey = process.env.OPENROUTER_API_KEY
  return Boolean(apiKey && apiKey.trim().length > 0 && apiKey !== 'your_openrouter_api_key_here')
}

/**
 * Returns the configured OpenRouter model identifier.
 * @returns {string}
 */
export const getOpenRouterModel = () => {
  return process.env.OPENROUTER_MODEL?.trim() || 'meta-llama/llama-3.3-70b-instruct:free'
}

/**
 * Instantiates the OpenAI SDK client configured for OpenRouter's endpoint.
 * Fails safely if the API key is unconfigured.
 * @returns {OpenAI}
 */
export const getOpenRouterClient = () => {
  if (!isOpenRouterConfigured()) {
    throw new Error('OPENROUTER_API_KEY is not configured in backend/.env')
  }

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY.trim(),
    defaultHeaders: {
      'HTTP-Referer': process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      'X-Title': 'SpendWise AI Financial Assistant',
    },
  })
}
