import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise'

let pool: Pool | null = null
let schemaReady: Promise<void> | null = null

export const configureDatabase = (databaseUrl: string | undefined) => {
  if (!databaseUrl || pool) return
  pool = mysql.createPool(databaseUrl)
}

export const hasRemoteDatabase = () => pool !== null

const ensureSchema = async () => {
  if (!pool) return
  schemaReady ??= pool.query(`
    CREATE TABLE IF NOT EXISTS app_documents (
      document_key VARCHAR(100) PRIMARY KEY,
      data JSON NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `).then(() => undefined)
  await schemaReady
}

export const readDocument = async <T>(key: string, fallbackFile: string, fallback: T): Promise<T> => {
  if (!pool) {
    try {
      return JSON.parse(await readFile(fallbackFile, 'utf8')) as T
    } catch {
      return fallback
    }
  }

  await ensureSchema()
  const [rows] = await pool.query<RowDataPacket[]>('SELECT data FROM app_documents WHERE document_key = ?', [key])
  if (rows[0]) return (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data) as T

  let value = fallback
  try {
    value = JSON.parse(await readFile(fallbackFile, 'utf8')) as T
  } catch {
    // Use the supplied initial value.
  }
  await writeDocument(key, value, fallbackFile)
  return value
}

export const writeDocument = async (key: string, value: unknown, fallbackFile: string) => {
  if (!pool) {
    await mkdir(path.dirname(fallbackFile), { recursive: true })
    await writeFile(fallbackFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    return
  }

  await ensureSchema()
  await pool.query(
    'INSERT INTO app_documents (document_key, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
    [key, JSON.stringify(value)],
  )
}

const identifier = (value: string) => {
  if (!/^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value)) throw new Error(`Invalid SQL identifier: ${value}`)
  return `\`${value}\``
}

const sqlValue = (value: unknown) =>
  value !== null && typeof value === 'object' ? JSON.stringify(value) : value

const requirePool = async () => {
  if (!pool) throw new Error('DATABASE_URL is not configured.')
  await ensureSchema()
  return pool
}

export const listSqlTables = async () => {
  const db = await requirePool()
  const [rows] = await db.query<RowDataPacket[]>(`
    SELECT TABLE_NAME AS name, TABLE_ROWS AS \`rows\`
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY TABLE_NAME
  `)
  return rows.map((row) => ({ name: String(row.name), rows: Number(row.rows ?? 0), shape: 'array' }))
}

export const readSqlTable = async (table: string) => {
  const db = await requirePool()
  const safeTable = identifier(table)
  const [columns] = await db.query<RowDataPacket[]>(
    'SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION',
    [table],
  )
  if (!columns.length) throw new Error(`Table "${table}" does not exist.`)
  const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${safeTable} LIMIT 500`)
  return { name: table, shape: 'array', columns: columns.map((column) => String(column.name)), rows }
}

type AdminOperation = {
  operation: string
  table: string
  column?: string
  index?: number
  value?: unknown
  values?: Record<string, unknown>
  whereColumn?: string
  whereValue?: unknown
}

export const executeSqlOperation = async (body: AdminOperation) => {
  const db = await requirePool()
  const table = identifier(body.table)

  if (body.operation === 'createTable') {
    await db.query(`CREATE TABLE ${table} (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY)`)
    return { table: body.table }
  }
  if (body.operation === 'dropTable') {
    await db.query(`DROP TABLE ${table}`)
    return { table: body.table }
  }
  if (body.operation === 'addColumn') {
    await db.query(`ALTER TABLE ${table} ADD COLUMN ${identifier(String(body.column ?? ''))} TEXT NULL`)
    return { operation: body.operation, table: body.table }
  }
  if (body.operation === 'dropColumn') {
    await db.query(`ALTER TABLE ${table} DROP COLUMN ${identifier(String(body.column ?? ''))}`)
    return { operation: body.operation, table: body.table }
  }

  const where = body.whereColumn ? ` WHERE ${identifier(body.whereColumn)} = ?` : ''
  const whereParams = body.whereColumn ? [body.whereValue] : []

  if (body.operation === 'select') {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${table}${where} LIMIT 500`, whereParams)
    return { rows }
  }
  if (body.operation === 'count') {
    const [rows] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) AS count FROM ${table}${where}`, whereParams)
    return { count: Number(rows[0]?.count ?? 0) }
  }
  if (body.operation === 'insert') {
    const values = body.values ?? {}
    const keys = Object.keys(values)
    if (!keys.length) throw new Error('At least one value is required.')
    await db.query(
      `INSERT INTO ${table} (${keys.map(identifier).join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      keys.map((key) => sqlValue(values[key])),
    )
  } else if (body.operation === 'update') {
    const values = body.values ?? {}
    const keys = Object.keys(values)
    if (!keys.length) throw new Error('At least one value is required.')
    await db.query(
      `UPDATE ${table} SET ${keys.map((key) => `${identifier(key)} = ?`).join(', ')}${where}`,
      [...keys.map((key) => sqlValue(values[key])), ...whereParams.map(sqlValue)],
    )
  } else if (body.operation === 'delete') {
    await db.query(`DELETE FROM ${table}${where}`, whereParams)
  } else if (body.operation === 'updateRow' || body.operation === 'deleteRow') {
    const [primaryKeys] = await db.query<RowDataPacket[]>(
      'SELECT COLUMN_NAME AS name FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ? ORDER BY ORDINAL_POSITION',
      [body.table, 'PRIMARY'],
    )
    const primaryKey = String(primaryKeys[0]?.name ?? '')
    if (!primaryKey) throw new Error('This table needs a primary key for row editing.')
    const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${table} LIMIT 1 OFFSET ?`, [Number(body.index ?? 0)])
    if (!rows[0]) throw new Error('Row not found.')
    if (body.operation === 'deleteRow') {
      await db.query(`DELETE FROM ${table} WHERE ${identifier(primaryKey)} = ?`, [rows[0][primaryKey]])
    } else {
      const values = body.values ?? {}
      const keys = Object.keys(values)
      await db.query(
        `UPDATE ${table} SET ${keys.map((key) => `${identifier(key)} = ?`).join(', ')} WHERE ${identifier(primaryKey)} = ?`,
        [...keys.map((key) => sqlValue(values[key])), rows[0][primaryKey]],
      )
    }
  } else {
    throw new Error('Unknown database operation.')
  }

  return { operation: body.operation, table: body.table }
}

export const executeRawQuery = async (query: string) => {
  const db = await requirePool()
  const sql = query.trim()
  if (!sql) throw new Error('Query is required.')
  const [result] = await db.query(sql)
  if (Array.isArray(result)) return { rows: result }
  return {
    affectedRows: result.affectedRows,
    insertId: Number(result.insertId),
  }
}
