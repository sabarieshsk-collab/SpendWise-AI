
import mongoose from 'mongoose'
import dns from 'node:dns'

dns.setServers(['172.29.117.199'])
let isConnected = false

// Prevent unhandled error events from crashing the server
mongoose.connection.on('error', (err) => {
  isConnected = false
  console.error(`[SpendWise Database] MongoDB Connection Event Error: ${err.message}`)
})

mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.warn('[SpendWise Database] MongoDB Disconnected.')
})

mongoose.connection.on('connected', () => {
  isConnected = true
  console.log('[SpendWise Database] MongoDB Connected successfully.')
})

/**
 * Safely redacts credentials from connection strings and error messages
 */
const sanitizeCredentials = (text) => {
  if (!text || typeof text !== 'string') return text
  return text.replace(/(mongodb(?:\+srv)?:\/\/)([^:@/]+):([^@/]+)@/gi, '$1[REDACTED]:[REDACTED]@')
}

/**
 * Connects to MongoDB database using MONGODB_URI environment variable.
 * Gracefully handles connection failures without crashing the server.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn(
      '[SpendWise Database] MONGODB_URI is not configured in backend/.env. Real database operations will return 503 until configured.'
    )
    return false
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    })

    isConnected = true
    console.log(
      `[SpendWise Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    )
    return true
  } catch (error) {
    isConnected = false

    const errorName = error.name || 'Error'
    const errorMsg = sanitizeCredentials(error.message)
    console.error(
      `[SpendWise Database] MongoDB Connection Error: [${errorName}] ${errorMsg}`
    )

    if (error.stack) {
      console.error(`[SpendWise Database] Stack Trace:\n${sanitizeCredentials(error.stack)}`)
    }

    if (error.cause) {
      if (error.cause instanceof Error) {
        const causeName = error.cause.name || 'Error'
        const causeMsg = sanitizeCredentials(error.cause.message)
        const causeCode = error.cause.code ? ` (Code: ${error.cause.code})` : ''
        console.error(`[SpendWise Database] Nested Cause: [${causeName}] ${causeMsg}${causeCode}`)
        if (error.cause.stack) {
          console.error(`[SpendWise Database] Nested Cause Stack:\n${sanitizeCredentials(error.cause.stack)}`)
        }
      } else if (typeof error.cause === 'object') {
        const causeSummary = error.cause.type ? `Topology Type: ${error.cause.type}` : JSON.stringify(error.cause)
        console.error(`[SpendWise Database] Nested Cause Context: ${sanitizeCredentials(causeSummary)}`)
      } else {
        console.error(`[SpendWise Database] Nested Cause: ${sanitizeCredentials(String(error.cause))}`)
      }
    }

    if (error.reason?.servers) {
      const serverEntries =
        error.reason.servers instanceof Map
          ? Array.from(error.reason.servers.entries())
          : Object.entries(error.reason.servers)

      console.error(
        `[SpendWise Database] Topology Server Details (${serverEntries.length} server${serverEntries.length === 1 ? '' : 's'}):`
      )

      for (const [address, serverDesc] of serverEntries) {
        const sErr = serverDesc?.error || serverDesc?.lastErrorObject
        if (sErr) {
          const sName = sErr.name || 'ConnectionError'
          const sMsg = sanitizeCredentials(sErr.message || 'No error message provided')
          const sCode = sErr.code ?? sErr.errno ?? 'N/A'
          console.error(
            `  - Server: ${address} | Error: [${sName}] ${sMsg} | Code: ${sCode}`
          )
          if (sErr.cause) {
            const sCauseMsg = sanitizeCredentials(sErr.cause.message || String(sErr.cause))
            const sCauseCode = sErr.cause.code ? ` (Code: ${sErr.cause.code})` : ''
            console.error(`    Nested Cause: ${sCauseMsg}${sCauseCode}`)
          }
        } else {
          console.error(
            `  - Server: ${address} | Status: ${serverDesc?.type || 'Unknown'} (No individual error reported)`
          )
        }
      }
    }

    return false
  }
}

/**
 * Returns whether MongoDB connection is currently active
 */
export const isDBConnected = () => {
  return isConnected && mongoose.connection.readyState === 1
}

export default connectDB
