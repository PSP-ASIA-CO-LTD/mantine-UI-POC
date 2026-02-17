import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { IncomingMessage, ServerResponse } from 'node:http'

const JSON_API_PREFIX = '/__json'

const readRequestBody = async (req: IncomingMessage): Promise<unknown> => {
  return await new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) {
        resolve(null)
        return
      }
      try {
        resolve(JSON.parse(body))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

const sendJson = (res: ServerResponse, status: number, payload: unknown) => {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

const safeFileName = (value: string | undefined) =>
  value && /^[a-zA-Z0-9_-]+$/.test(value) ? value : null

const readJsonArray = async (filePath: string) => {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error: any) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

const writeJsonArray = async (filePath: string, data: unknown[]) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
}

const jsonCrudPlugin = (): Plugin => ({
  name: 'json-crud-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url) return next()
      const url = new URL(req.url, 'http://localhost')
      if (!url.pathname.startsWith(JSON_API_PREFIX)) return next()

      const segments = url.pathname
        .slice(JSON_API_PREFIX.length)
        .split('/')
        .filter(Boolean)
      const file = safeFileName(segments[0])
      const id = segments[1]

      if (!file) {
        sendJson(res, 400, { error: 'Invalid file name' })
        return
      }

      const filePath = path.join(process.cwd(), 'public', 'data', `${file}.json`)

      try {
        if (req.method === 'GET') {
          const items = await readJsonArray(filePath)
          if (id) {
            const item = items.find((entry: any) => entry?.id === id)
            if (!item) {
              sendJson(res, 404, { error: 'Not found' })
              return
            }
            sendJson(res, 200, item)
            return
          }
          sendJson(res, 200, items)
          return
        }

        if (req.method === 'POST') {
          const payload = await readRequestBody(req)
          if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            sendJson(res, 400, { error: 'Invalid JSON payload' })
            return
          }

          const items = await readJsonArray(filePath)
          const entry: any = { ...payload }
          if (!entry.id) {
            entry.id = `${file}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          }
          if (items.some((item: any) => item?.id === entry.id)) {
            sendJson(res, 409, { error: 'Duplicate id' })
            return
          }
          items.push(entry)
          await writeJsonArray(filePath, items)
          sendJson(res, 201, entry)
          return
        }

        if (req.method === 'PUT' && !id) {
          const payload = await readRequestBody(req)
          if (!Array.isArray(payload)) {
            sendJson(res, 400, { error: 'Expected an array payload' })
            return
          }
          await writeJsonArray(filePath, payload)
          sendJson(res, 200, payload)
          return
        }

        if (req.method === 'PATCH' || (req.method === 'PUT' && id)) {
          if (!id) {
            sendJson(res, 400, { error: 'Missing id' })
            return
          }
          const payload = await readRequestBody(req)
          if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            sendJson(res, 400, { error: 'Invalid JSON payload' })
            return
          }
          const items = await readJsonArray(filePath)
          const index = items.findIndex((item: any) => item?.id === id)
          if (index === -1) {
            sendJson(res, 404, { error: 'Not found' })
            return
          }
          const updated = { ...(items[index] as any), ...(payload as any), id }
          items[index] = updated
          await writeJsonArray(filePath, items)
          sendJson(res, 200, updated)
          return
        }

        if (req.method === 'DELETE') {
          if (!id) {
            sendJson(res, 400, { error: 'Missing id' })
            return
          }
          const items = await readJsonArray(filePath)
          const index = items.findIndex((item: any) => item?.id === id)
          if (index === -1) {
            sendJson(res, 404, { error: 'Not found' })
            return
          }
          const existing = items[index] as any
          const deletedAt = existing?.deletedAt ?? new Date().toISOString()
          items[index] = { ...existing, deletedAt }
          await writeJsonArray(filePath, items)
          sendJson(res, 200, { ok: true, deletedAt })
          return
        }

        sendJson(res, 405, { error: 'Method not allowed' })
      } catch (error) {
        if (error instanceof SyntaxError) {
          sendJson(res, 400, { error: 'Invalid JSON payload' })
          return
        }
        console.error('JSON CRUD error:', error)
        sendJson(res, 500, { error: 'Server error' })
      }
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jsonCrudPlugin()],
})
