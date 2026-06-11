import { fileURLToPath, URL } from 'node:url'
import { createHash } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import type { ServerResponse } from 'node:http'
import path from 'node:path'

import { defineConfig, type Connect, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

type GalleryRecord = { imageUrl: string; alt: string }

const galleryDirectory = fileURLToPath(new URL('./public/gallery', import.meta.url))
const galleryDatabase = fileURLToPath(new URL('./database/gallery.json', import.meta.url))
const contentDatabase = fileURLToPath(new URL('./database/website-content.json', import.meta.url))

const readGallery = async () => {
  try {
    return JSON.parse(await readFile(galleryDatabase, 'utf8')) as GalleryRecord[]
  } catch {
    return []
  }
}

const writeGallery = async (records: GalleryRecord[]) => {
  await mkdir(path.dirname(galleryDatabase), { recursive: true })
  await writeFile(galleryDatabase, `${JSON.stringify(records, null, 2)}\n`, 'utf8')
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

const contentApi = (): Plugin => {
  const middleware: Connect.NextHandleFunction = async (request, response, next) => {
    if (!request.url?.startsWith('/api/content')) return next()

    try {
      if (request.method === 'GET') {
        try {
          sendJson(response, 200, JSON.parse(await readFile(contentDatabase, 'utf8')))
        } catch {
          response.statusCode = 204
          response.end()
        }
        return
      }

      if (request.method === 'PUT') {
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

        await mkdir(path.dirname(contentDatabase), { recursive: true })
        await writeFile(contentDatabase, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
        sendJson(response, 200, content)
        return
      }

      sendJson(response, 405, { message: 'Method not allowed.' })
    } catch (error) {
      sendJson(response, 500, { message: error instanceof Error ? error.message : 'Content request failed.' })
    }
  }

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    contentApi(),
    galleryApi(),
    tailwindcss(),
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
