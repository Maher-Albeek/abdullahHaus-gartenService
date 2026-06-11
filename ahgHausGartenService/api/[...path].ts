import type { IncomingMessage, ServerResponse } from 'node:http'

import { handleApiRequest } from '../vite.config'

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    await handleApiRequest(request, response)
  } catch (error) {
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
      message: error instanceof Error ? error.message : 'API request failed.',
    }))
  }
}
