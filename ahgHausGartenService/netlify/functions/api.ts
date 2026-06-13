import { Readable } from 'node:stream'
import type { IncomingMessage, ServerResponse } from 'node:http'

type NetlifyEvent = {
  body: string | null
  headers: Record<string, string | undefined>
  httpMethod: string
  isBase64Encoded: boolean
  path?: string
  rawUrl?: string
  multiValueQueryStringParameters?: Record<string, string[] | undefined> | null
  queryStringParameters?: Record<string, string | undefined> | null
}

type NetlifyResponse = {
  statusCode: number
  headers: Record<string, string>
  multiValueHeaders?: Record<string, string[]>
  body: string
}

const apiUrl = (event: NetlifyEvent) => {
  const functionPath = event.path?.match(/^\/\.netlify\/functions\/api\/?(.*)$/)?.[1]
  const rawPath = event.rawUrl
    ? new URL(event.rawUrl).pathname.match(/^\/(?:\.netlify\/functions\/api|api)\/?(.*)$/)?.[1]
    : undefined
  const path =
    event.queryStringParameters?.__path ??
    event.multiValueQueryStringParameters?.__path?.[0] ??
    functionPath ??
    rawPath
  const search = new URLSearchParams()

  for (const [key, values] of Object.entries(event.multiValueQueryStringParameters ?? {})) {
    if (key !== '__path') values?.forEach((value) => search.append(key, value))
  }
  if (!event.multiValueQueryStringParameters) {
    for (const [key, value] of Object.entries(event.queryStringParameters ?? {})) {
      if (key !== '__path' && value !== undefined) search.append(key, value)
    }
  }

  const query = search.toString()
  return `/api${path ? `/${path}` : ''}${query ? `?${query}` : ''}`
}

const createRequest = (event: NetlifyEvent) => {
  const body = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8')
    : Buffer.alloc(0)
  const request = Readable.from(body.length ? [body] : []) as IncomingMessage
  request.method = event.httpMethod
  request.url = apiUrl(event)
  request.headers = Object.fromEntries(
    Object.entries(event.headers).map(([key, value]) => [key.toLowerCase(), value]),
  )
  return request
}

const createResponse = () => {
  const headers = new Map<string, string | string[]>()
  let finish: (response: NetlifyResponse) => void
  const completed = new Promise<NetlifyResponse>((resolve) => {
    finish = resolve
  })

  const responseAdapter = {
    statusCode: 200,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers.set(name.toLowerCase(), Array.isArray(value) ? [...value] : String(value))
      return responseAdapter
    },
    end(body?: string | Buffer) {
      const normalHeaders: Record<string, string> = {}
      const multiValueHeaders: Record<string, string[]> = {}
      for (const [name, value] of headers) {
        if (Array.isArray(value)) multiValueHeaders[name] = value
        else normalHeaders[name] = value
      }
      finish({
        statusCode: responseAdapter.statusCode,
        headers: normalHeaders,
        ...(Object.keys(multiValueHeaders).length ? { multiValueHeaders } : {}),
        body: body ? body.toString() : '',
      })
      return responseAdapter
    },
  }
  const response = responseAdapter as unknown as ServerResponse

  return { response, completed }
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  try {
    const request = createRequest(event)
    const { response, completed } = createResponse()
    const { configureApi, handleApiRequest } = await import('../../server/api')
    configureApi()
    await handleApiRequest(request, response)
    return await completed
  } catch (error) {
    console.error('API function failed:', error)
    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: error instanceof Error ? error.message : 'API request failed.',
      }),
    }
  }
}
