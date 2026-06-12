import { describe, expect, it } from 'vitest'

import { handler } from '../../netlify/functions/api'

const event = (path: string) => ({
  body: null,
  headers: {},
  httpMethod: 'GET',
  isBase64Encoded: false,
  queryStringParameters: { __path: path },
})

describe('production API handler', () => {
  it('dispatches API routes without the Vite development server', async () => {
    const response = await handler(event('content'))

    expect([200, 204]).toContain(response.statusCode)
    if (response.statusCode === 200) {
      expect(response.headers['content-type']).toContain('application/json')
    }
  })

  it('returns JSON for unknown API routes', async () => {
    const response = await handler(event('unknown'))

    expect(response.statusCode).toBe(404)
    expect(JSON.parse(response.body)).toEqual({ message: 'API route not found.' })
  })
})
