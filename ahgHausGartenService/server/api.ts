import { URL } from 'node:url'
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import path from 'node:path'
import { promisify } from 'node:util'

import type { Connect, Plugin } from 'vite'
import {
  configureDatabase,
  consumePasswordResetToken,
  executeSqlOperation,
  findUserByEmail,
  listUsers,
  listSqlTables,
  recordUserLogin,
  readGalleryRecords,
  readMessageRecords,
  readSqlTable,
  readWebsiteContent,
  saveUser,
  storePasswordResetToken,
  syncConfiguredUser,
  updateUser,
  writeGalleryRecords,
  writeMessageRecords,
  writeWebsiteContent,
} from './database'

type GalleryRecord = { imageUrl: string; alt: string }
type MessageRecord = {
  id: string
  name: string
  email: string
  service: string
  message: string
  createdAt: string
  read: boolean
}

const galleryDirectory = path.resolve('public/gallery')
const galleryDatabase = path.resolve('database/gallery.json')
const contentDatabase = path.resolve('database/website-content.json')
const messagesDatabase = path.resolve('database/messages.json')
const usersDatabase = path.resolve('database/users.json')
const databaseFiles = [galleryDatabase, contentDatabase, messagesDatabase, usersDatabase]
const sessions = new Map<string, { user: { id: string; email: string; displayName: string; role: string }; expiresAt: number }>()
const sessionLifetime = 60 * 60 * 8
const scryptAsync = promisify(scrypt)
const apiMiddlewares: Connect.NextHandleFunction[] = []

const databaseApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/database')) return next()
    if (!requirePermission(request, response, 'database')) return

    try {
      const url = new URL(request.url, 'http://localhost')
      const requestedTable = url.searchParams.get('table')

      if (request.method === 'GET') {
        sendJson(response, 200, requestedTable ? await readSqlTable(requestedTable) : await listSqlTables())
        return
      }

      if (!request.headers['content-type']?.startsWith('application/json')) {
        sendJson(response, 415, { message: 'Only JSON content is accepted.' })
        return
      }

      const body = JSON.parse((await readBody(request)).toString('utf8')) as Parameters<typeof executeSqlOperation>[0]
      sendJson(response, body.operation === 'createTable' ? 201 : 200, await executeSqlOperation(body))
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code
      sendJson(response, code === 'ENOENT' ? 404 : 400, {
        message: error instanceof Error ? error.message : 'Database request failed.',
      })
    }
  }
  apiMiddlewares.push(middleware)

  return {
    name: 'database-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

const readMessages = async () => {
  return readMessageRecords(messagesDatabase)
}

const writeMessages = async (records: MessageRecord[]) => {
  await writeMessageRecords(records, messagesDatabase)
}

const readGallery = async () => {
  return readGalleryRecords(galleryDatabase)
}

const writeGallery = async (records: GalleryRecord[]) => {
  await writeGalleryRecords(records, galleryDatabase)
}

const readBody = (request: Connect.IncomingMessage) =>
  new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })

const sendJson = (response: ServerResponse, status: number, value: unknown) => {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json')
  response.end(JSON.stringify(value))
}

const parseCookies = (request: Connect.IncomingMessage) =>
  Object.fromEntries(
    String(request.headers.cookie ?? '')
      .split(';')
      .map((cookie) => cookie.trim().split('='))
      .filter(([key, value]) => key && value)
      .map(([key, value]) => [key, decodeURIComponent(value!)]),
  )

const currentSession = (request: Connect.IncomingMessage) => {
  const token = parseCookies(request).ahg_session
  const session = token ? sessions.get(token) : undefined
  if (token && session && session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return undefined
  }
  return session
}

const requireAuthentication = (request: Connect.IncomingMessage, response: ServerResponse) => {
  if (currentSession(request)) return true
  sendJson(response, 401, { message: 'Authentication required.' })
  return false
}

type UserRole = 'boss' | 'owner' | 'editor'
const validRoles: UserRole[] = ['boss', 'owner', 'editor']
const roleAllows = (role: string, permission: 'database' | 'users' | 'messages' | 'content') => {
  if (role === 'boss') return true
  if (role === 'owner') return permission !== 'database'
  return role === 'editor' && permission === 'content'
}
const requirePermission = (
  request: Connect.IncomingMessage,
  response: ServerResponse,
  permission: 'database' | 'users' | 'messages' | 'content',
) => {
  const session = currentSession(request)
  if (!session) {
    sendJson(response, 401, { message: 'Authentication required.' })
    return false
  }
  if (!roleAllows(session.user.role, permission)) {
    sendJson(response, 403, { message: 'You do not have permission for this action.' })
    return false
  }
  return true
}

const hashPassword = async (password: string) => {
  const salt = randomBytes(16).toString('hex')
  const hash = await scryptAsync(password, salt, 64) as Buffer
  return `scrypt$${salt}$${hash.toString('hex')}`
}

const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, salt, expectedHex] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !expectedHex) return false
  const expected = Buffer.from(expectedHex, 'hex')
  const actual = await scryptAsync(password, salt, expected.length) as Buffer
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

const authApi = (
  adminEmail: string | undefined,
  adminPassword: string | undefined,
  brevoApiKey: string | undefined,
  emailFrom: string | undefined,
  emailFromName: string,
  appUrl: string,
): Plugin => {
  let initialUserReady: Promise<void> | undefined
  const ensureInitialUser = () => {
    if (!adminEmail || !adminPassword) return Promise.resolve()
    initialUserReady ??= hashPassword(adminPassword).then((passwordHash) =>
      syncConfiguredUser({
        id: randomUUID(),
        email: adminEmail.trim().toLowerCase(),
        passwordHash,
        displayName: 'Administrator',
        role: 'boss',
        isActive: true,
      }, usersDatabase),
    )
    return initialUserReady
  }

  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/auth')) return next()

    try {
      const pathname = new URL(request.url, 'http://localhost').pathname
      if (pathname === '/api/auth/session' && request.method === 'GET') {
        const session = currentSession(request)
        sendJson(response, session ? 200 : 401, session ? { user: session.user } : { message: 'Not authenticated.' })
        return
      }

      if (pathname === '/api/auth/login' && request.method === 'POST') {
        if (!request.headers['content-type']?.startsWith('application/json')) {
          sendJson(response, 415, { message: 'Only JSON content is accepted.' })
          return
        }
        await ensureInitialUser()
        const body = JSON.parse((await readBody(request)).toString('utf8')) as { email?: unknown; password?: unknown }
        const email = String(body.email ?? '').trim().toLowerCase()
        const password = String(body.password ?? '')
        const user = email && password ? await findUserByEmail(email, usersDatabase) : null
        if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) {
          sendJson(response, 401, { message: 'Invalid email or password.' })
          return
        }
        const token = randomBytes(32).toString('hex')
        const publicUser = { id: user.id, email: user.email, displayName: user.displayName, role: user.role }
        sessions.set(token, { user: publicUser, expiresAt: Date.now() + sessionLifetime * 1000 })
        response.setHeader(
          'Set-Cookie',
          `ahg_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${sessionLifetime}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`,
        )
        await recordUserLogin(user.id)
        sendJson(response, 200, { user: publicUser })
        return
      }

      if (pathname === '/api/auth/logout' && request.method === 'POST') {
        const token = parseCookies(request).ahg_session
        if (token) sessions.delete(token)
        response.setHeader('Set-Cookie', 'ahg_session=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0')
        sendJson(response, 200, { success: true })
        return
      }

      if (pathname === '/api/auth/change-password' && request.method === 'POST') {
        const session = currentSession(request)
        if (!session) {
          sendJson(response, 401, { message: 'Authentication required.' })
          return
        }
        const body = JSON.parse((await readBody(request)).toString('utf8')) as { currentPassword?: unknown; newPassword?: unknown }
        const currentPassword = String(body.currentPassword ?? '')
        const newPassword = String(body.newPassword ?? '')
        const user = await findUserByEmail(session.user.email, usersDatabase)
        if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
          sendJson(response, 400, { message: 'Current password is incorrect.' })
          return
        }
        if (newPassword.length < 8) {
          sendJson(response, 400, { message: 'New password must contain at least 8 characters.' })
          return
        }
        await updateUser(user.id, { passwordHash: await hashPassword(newPassword) }, usersDatabase)
        sendJson(response, 200, { success: true })
        return
      }

      if (pathname === '/api/auth/forgot-password' && request.method === 'POST') {
        const body = JSON.parse((await readBody(request)).toString('utf8')) as { email?: unknown }
        const email = String(body.email ?? '').trim().toLowerCase()
        const user = email ? await findUserByEmail(email, usersDatabase) : null
        if (user?.isActive && brevoApiKey && emailFrom) {
          const token = randomBytes(32).toString('hex')
          await storePasswordResetToken(createHash('sha256').update(token).digest('hex'), user.id, new Date(Date.now() + 60 * 60 * 1000))
          const resetUrl = `${appUrl.replace(/\/$/, '')}/reset-password?token=${token}`
          const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': brevoApiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
              sender: { email: emailFrom, name: emailFromName },
              to: [{ email: user.email, name: user.displayName || user.email }],
              subject: 'Passwort zurücksetzen',
              htmlContent: `<p>Sie haben eine Passwort-Zurücksetzung angefordert.</p><p><a href="${resetUrl}">Passwort zurücksetzen</a></p><p>Der Link ist eine Stunde gültig.</p>`,
            }),
          })
          if (!emailResponse.ok) throw new Error('Password reset email could not be sent.')
        }
        sendJson(response, 200, { message: 'If the account exists, a reset email has been sent.' })
        return
      }

      if (pathname === '/api/auth/reset-password' && request.method === 'POST') {
        const body = JSON.parse((await readBody(request)).toString('utf8')) as { token?: unknown; password?: unknown }
        const token = String(body.token ?? '')
        const password = String(body.password ?? '')
        if (password.length < 8) {
          sendJson(response, 400, { message: 'Password must contain at least 8 characters.' })
          return
        }
        const updated = await consumePasswordResetToken(createHash('sha256').update(token).digest('hex'), await hashPassword(password))
        sendJson(response, updated ? 200 : 400, updated ? { success: true } : { message: 'Reset link is invalid or expired.' })
        return
      }

      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 500, { message: error instanceof Error ? error.message : 'Authentication request failed.' })
    }
  }
  apiMiddlewares.push(middleware)

  return {
    name: 'auth-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

const usersApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/users')) return next()
    if (!requirePermission(request, response, 'users')) return
    try {
      const session = currentSession(request)!
      if (request.method === 'GET') {
        sendJson(response, 200, await listUsers(usersDatabase))
        return
      }
      const body = JSON.parse((await readBody(request)).toString('utf8')) as {
        id?: unknown; email?: unknown; displayName?: unknown; role?: unknown; isActive?: unknown; password?: unknown
      }
      const role = String(body.role ?? '')
      if (!validRoles.includes(role as UserRole) || (role === 'boss' && session.user.role !== 'boss')) {
        sendJson(response, 403, { message: 'This role cannot be assigned.' })
        return
      }
      if (request.method === 'POST') {
        const email = String(body.email ?? '').trim().toLowerCase()
        const password = String(body.password ?? '')
        if (!email.includes('@') || password.length < 8) {
          sendJson(response, 400, { message: 'Valid email and a password with at least 8 characters are required.' })
          return
        }
        await saveUser({
          id: randomUUID(), email, passwordHash: await hashPassword(password),
          displayName: String(body.displayName ?? '').trim(), role, isActive: true,
        }, usersDatabase)
        sendJson(response, 201, { success: true })
        return
      }
      if (request.method === 'PATCH') {
        const id = String(body.id ?? '')
        const target = (await listUsers(usersDatabase)).find((user) => user.id === id)
        if (!target || (target.role === 'boss' && session.user.role !== 'boss')) {
          sendJson(response, 403, { message: 'This user cannot be changed.' })
          return
        }
        await updateUser(id, {
          displayName: String(body.displayName ?? target.displayName).trim(),
          role,
          isActive: Boolean(body.isActive),
        }, usersDatabase)
        sendJson(response, 200, { success: true })
        return
      }
      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 400, { message: error instanceof Error ? error.message : 'User request failed.' })
    }
  }
  apiMiddlewares.push(middleware)
  return {
    name: 'users-api',
    configureServer(server) { server.middlewares.use(middleware) },
    configurePreviewServer(server) { server.middlewares.use(middleware) },
  }
}

const contentApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/content')) return next()

    try {
      if (request.method === 'GET') {
        const content = await readWebsiteContent(contentDatabase)
        if (content) sendJson(response, 200, content)
        else {
          response.statusCode = 204
          response.end()
        }
        return
      }

      if (request.method === 'PUT') {
        if (!requirePermission(request, response, 'content')) return
        if (!request.headers['content-type']?.startsWith('application/json')) {
          sendJson(response, 415, { message: 'Only JSON content is accepted.' })
          return
        }

        const content = JSON.parse((await readBody(request)).toString('utf8')) as {
          brand?: unknown
          contact?: unknown
          sections?: unknown
        }
        if (!content.brand || !content.contact || !Array.isArray(content.sections)) {
          sendJson(response, 400, { message: 'Invalid website content.' })
          return
        }

        await writeWebsiteContent(content as Parameters<typeof writeWebsiteContent>[0], contentDatabase)
        sendJson(response, 200, content)
        return
      }

      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 500, { message: error instanceof Error ? error.message : 'Content request failed.' })
    }
  }
  apiMiddlewares.push(middleware)

  return {
    name: 'content-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

const galleryApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/gallery')) return next()

    try {
      if (request.method === 'GET') {
        sendJson(response, 200, await readGallery())
        return
      }

      if (request.method === 'POST') {
        if (!requirePermission(request, response, 'content')) return
        if (!request.headers['content-type']?.startsWith('image/avif')) {
          sendJson(response, 415, { message: 'Only AVIF uploads are accepted.' })
          return
        }

        const body = await readBody(request)
        if (!body.length) {
          sendJson(response, 400, { message: 'The uploaded image is empty.' })
          return
        }

        const originalName = decodeURIComponent(String(request.headers['x-file-name'] ?? 'gallery-image'))
        const baseName =
          originalName
            .replace(/\.[^.]+$/, '')
            .normalize('NFKD')
            .replace(/[^a-zA-Z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || 'gallery-image'
        const filename = `${baseName}-${createHash('sha256').update(body).digest('hex').slice(0, 12)}.avif`
        const record = {
          imageUrl: `/gallery/${filename}`,
          alt: decodeURIComponent(String(request.headers['x-image-alt'] ?? baseName)),
        }

        await mkdir(galleryDirectory, { recursive: true })
        await writeFile(path.join(galleryDirectory, filename), body)
        if (request.headers['x-image-usage'] !== 'about') {
          const records = await readGallery()
          const existingIndex = records.findIndex((entry) => entry.imageUrl === record.imageUrl)
          if (existingIndex >= 0) records[existingIndex] = record
          else records.push(record)
          await writeGallery(records)
        }
        sendJson(response, 201, record)
        return
      }

      if (request.method === 'DELETE') {
        if (!requirePermission(request, response, 'content')) return
        const imageUrl = decodeURIComponent(new URL(request.url, 'http://localhost').searchParams.get('path') ?? '')
        if (!imageUrl.startsWith('/gallery/')) {
          sendJson(response, 400, { message: 'Only uploaded gallery images can be deleted.' })
          return
        }

        await unlink(path.join(galleryDirectory, path.basename(imageUrl))).catch(() => undefined)
        await writeGallery((await readGallery()).filter((entry) => entry.imageUrl !== imageUrl))
        sendJson(response, 200, { imageUrl })
        return
      }

      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 500, { message: error instanceof Error ? error.message : 'Gallery request failed.' })
    }
  }
  apiMiddlewares.push(middleware)

  return {
    name: 'gallery-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

const messagesApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/messages')) return next()

    try {
      if (request.method === 'GET') {
        if (!requirePermission(request, response, 'messages')) return
        sendJson(response, 200, await readMessages())
        return
      }

      if (request.method === 'POST') {
        if (!request.headers['content-type']?.startsWith('application/json')) {
          sendJson(response, 415, { message: 'Only JSON content is accepted.' })
          return
        }

        const body = JSON.parse((await readBody(request)).toString('utf8')) as Partial<MessageRecord>
        const name = String(body.name ?? '').trim()
        const email = String(body.email ?? '').trim()
        const service = String(body.service ?? '').trim()
        const message = String(body.message ?? '').trim()
        if (!name || !email || !message || !email.includes('@')) {
          sendJson(response, 400, { message: 'Name, valid email, and message are required.' })
          return
        }

        const record: MessageRecord = {
          id: randomUUID(),
          name: name.slice(0, 120),
          email: email.slice(0, 254),
          service: service.slice(0, 120),
          message: message.slice(0, 5000),
          createdAt: new Date().toISOString(),
          read: false,
        }
        await writeMessages([record, ...(await readMessages())])
        sendJson(response, 201, record)
        return
      }

      if (request.method === 'PATCH') {
        if (!requirePermission(request, response, 'messages')) return
        const id = new URL(request.url, 'http://localhost').searchParams.get('id')
        if (!id) {
          sendJson(response, 400, { message: 'Message id is required.' })
          return
        }
        const records = await readMessages()
        const updated = records.map((record) => record.id === id ? { ...record, read: true } : record)
        await writeMessages(updated)
        sendJson(response, 200, updated.find((record) => record.id === id))
        return
      }

      if (request.method === 'DELETE') {
        if (!requirePermission(request, response, 'messages')) return
        const id = new URL(request.url, 'http://localhost').searchParams.get('id')
        if (!id) {
          sendJson(response, 400, { message: 'Message id is required.' })
          return
        }
        await writeMessages((await readMessages()).filter((record) => record.id !== id))
        sendJson(response, 200, { id })
        return
      }

      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 500, { message: error instanceof Error ? error.message : 'Message request failed.' })
    }
  }
  apiMiddlewares.push(middleware)

  return {
    name: 'messages-api',
    configureServer(server) {
      server.middlewares.use(middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware)
    },
  }
}

const databaseWatchGuard = (): Plugin => ({
  name: 'database-watch-guard',
  configureServer(server) {
    server.watcher.unwatch(databaseFiles)
  },
})

export const handleApiRequest = async (request: Connect.IncomingMessage, response: ServerResponse) => {
  const run = async (index: number): Promise<void> => {
    const middleware = apiMiddlewares[index]
    if (!middleware) {
      sendJson(response, 404, { message: 'API route not found.' })
      return
    }

    await new Promise<void>((resolve, reject) => {
      let continued = false
      const next: Connect.NextFunction = (error?: unknown) => {
        continued = true
        if (error) reject(error)
        else resolve(run(index + 1))
      }

      Promise.resolve(middleware(request, response, next))
        .then(() => {
          if (!continued) resolve()
        })
        .catch(reject)
    })
  }

  await run(0)
}

let configured = false

export const configureApi = (env: Record<string, string | undefined> = process.env) => {
  if (configured) return []
  configured = true
  configureDatabase(env.DATABASE_URL)

  return [
    databaseWatchGuard(),
    authApi(
      env.ADMIN_EMAIL,
      env.ADMIN_PASSWORD,
      env.BREVO_API_KEY,
      env.EMAIL_FROM,
      env.EMAIL_FROM_NAME || 'AHG Haus & Gartenservice',
      env.APP_URL || 'http://localhost:5173',
    ),
    usersApi(),
    contentApi(),
    galleryApi(),
    messagesApi(),
    databaseApi(),
  ]
}
