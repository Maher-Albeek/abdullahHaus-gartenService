import { describe, expect, it } from 'vitest'

import { handler } from '../../netlify/functions/api'

const event = (path: string, method = 'GET', body: string | null = null) => ({
  body,
  headers: body ? { 'content-type': 'application/json' } : {},
  httpMethod: method,
  isBase64Encoded: false,
  path: `/.netlify/functions/api/${path}`,
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

  it('rejects weak reset passwords before accessing the database', async () => {
    const response = await handler(event(
      'auth/reset-password',
      'POST',
      JSON.stringify({ token: 'reset-token', password: 'weak-password' }),
    ))

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).message).toContain('at least 12 characters')
  })
})
