import { createServer } from 'node:http'
import { afterEach, describe, expect, it } from 'vitest'

import handler from '../../api/[...path]'

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })))
})

describe('production API handler', () => {
  it('dispatches API routes without the Vite development server', async () => {
    const server = createServer(handler)
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server did not start.')

    const response = await fetch(`http://127.0.0.1:${address.port}/api/content`)

    expect(response.status).not.toBe(404)
    expect(response.headers.get('content-type')).toContain('application/json')
  })

  it('returns JSON for unknown API routes', async () => {
    const server = createServer(handler)
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Test server did not start.')

    const response = await fetch(`http://127.0.0.1:${address.port}/api/unknown`)

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ message: 'API route not found.' })
  })
})
