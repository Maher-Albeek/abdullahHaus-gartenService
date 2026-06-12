import type { IncomingMessage, ServerResponse } from 'node:http'

import { handleApiRequest } from '../vite.config'

const restoreApiPath = (request: IncomingMessage) => {
  const url = new URL(request.url ?? '/api', 'http://localhost')
  const path = url.searchParams.get('__path')
  url.searchParams.delete('__path')
  request.url = `/api${path ? `/${path}` : ''}${url.search}`
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    restoreApiPath(request)
    await handleApiRequest(request, response)
  } catch (error) {
    response.statusCode = 500
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({
      message: error instanceof Error ? error.message : 'API request failed.',
    }))
  }
}
