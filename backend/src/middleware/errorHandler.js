/**
 * Centralized error handler middleware.
 * Sanitizes and formats error responses without leaking internal stacks or API secrets.
 */
export const errorHandler = (err, req, res, next) => {
  // Safe console notification without leaking secrets or payload data
  console.error(`[Server Error] ${req.method} ${req.path} - ${err.message || 'Internal failure'}`)

  // Handle payload too large
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      error: 'Request payload exceeds the allowed limit (10kb).',
    })
  }

  // Handle invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Malformed JSON payload in request body.',
    })
  }

  // Handle configuration errors
  if (err.message && err.message.includes('OPENROUTER_API_KEY is not configured')) {
    return res.status(503).json({
      success: false,
      error: 'OpenRouter service is not configured. Please add OPENROUTER_API_KEY to backend/.env',
    })
  }

  // Handle OpenRouter / Provider API specific errors safely
  const statusCode = err.status || err.statusCode || 500
  const userSafeMessage =
    statusCode >= 500
      ? 'An error occurred while communicating with the AI service. Please verify your API key and quota.'
      : err.message || 'Request could not be processed.'

  return res.status(statusCode).json({
    success: false,
    error: userSafeMessage,
  })
}

export default errorHandler
