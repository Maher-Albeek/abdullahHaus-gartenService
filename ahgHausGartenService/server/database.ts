import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import mysql, { type Pool, type RowDataPacket } from 'mysql2/promise'

let pool: Pool | null = null
let schemaReady: Promise<void> | null = null

type ContentItem = Record<string, string | number | boolean>
type WebsiteContent = {
  brand: {
    businessName: string
    logoUrl: string
    primaryColor: string
    accentColor: string
  }
  contact: {
    phone: string
    email: string
    address: string
    whatsapp: string
    instagram: string
    facebook: string
  }
  sections: Array<{
    id: string
    label: string
    description: string
    enabled: boolean
    content: ContentItem
    items: ContentItem[]
  }>
}
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
export type UserRecord = {
  id: string
  email: string
  passwordHash: string
  displayName: string
  role: string
  isActive: boolean
}
export type PublicUserRecord = Omit<UserRecord, 'passwordHash'>

export const configureDatabase = (databaseUrl: string | undefined) => {
  if (!databaseUrl || pool) return
  pool = mysql.createPool(databaseUrl)
}

export const hasRemoteDatabase = () => pool !== null

const ensureSchema = async () => {
  if (!pool) return
  schemaReady ??= Promise.all([
    pool.query(`
      CREATE TABLE IF NOT EXISTS app_documents (
        document_key VARCHAR(100) PRIMARY KEY,
        data JSON NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `),
    pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(254) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100) NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'admin',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMP NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY users_email_unique (email)
      )
    `),
    pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        token_hash CHAR(64) PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX password_reset_user_id (user_id)
      )
    `),
  ]).then(() => undefined)
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

const jsonObject = (value: unknown): ContentItem => {
  if (typeof value === 'string') return JSON.parse(value) as ContentItem
  return (value ?? {}) as ContentItem
}

export const readWebsiteContent = async (fallbackFile: string): Promise<WebsiteContent | null> => {
  if (!pool) return readDocument<WebsiteContent | null>('website-content', fallbackFile, null)

  await ensureSchema()
  const [brandRows] = await pool.query<RowDataPacket[]>('SELECT * FROM brand ORDER BY id LIMIT 1')
  const [contactRows] = await pool.query<RowDataPacket[]>('SELECT * FROM contact ORDER BY id LIMIT 1')
  const [sectionRows] = await pool.query<RowDataPacket[]>('SELECT * FROM sections ORDER BY sort_order, id')
  const [itemRows] = await pool.query<RowDataPacket[]>('SELECT * FROM section_items ORDER BY section_id, sort_order, id')
  if (!brandRows[0] || !contactRows[0] || !sectionRows.length) return null

  const itemsBySection = new Map<number, ContentItem[]>()
  for (const row of itemRows) {
    const sectionItems = itemsBySection.get(Number(row.section_id)) ?? []
    sectionItems.push(jsonObject(row.item_data))
    itemsBySection.set(Number(row.section_id), sectionItems)
  }

  return {
    brand: {
      businessName: String(brandRows[0].business_name ?? ''),
      logoUrl: String(brandRows[0].logo_url ?? ''),
      primaryColor: String(brandRows[0].primary_color ?? ''),
      accentColor: String(brandRows[0].accent_color ?? ''),
    },
    contact: {
      phone: String(contactRows[0].phone ?? ''),
      email: String(contactRows[0].email ?? ''),
      address: String(contactRows[0].address ?? ''),
      whatsapp: String(contactRows[0].whatsapp ?? ''),
      instagram: String(contactRows[0].instagram ?? ''),
      facebook: String(contactRows[0].facebook ?? ''),
    },
    sections: sectionRows.map((row) => ({
      id: String(row.section_key),
      label: String(row.label ?? ''),
      description: String(row.description ?? ''),
      enabled: Boolean(row.enabled),
      content: jsonObject(row.content),
      items: itemsBySection.get(Number(row.id)) ?? [],
    })),
  }
}

export const writeWebsiteContent = async (content: WebsiteContent, fallbackFile: string) => {
  if (!pool) {
    await writeDocument('website-content', content, fallbackFile)
    return
  }

  await ensureSchema()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.query(
      `INSERT INTO brand (id, business_name, logo_url, primary_color, accent_color)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE business_name = VALUES(business_name), logo_url = VALUES(logo_url),
       primary_color = VALUES(primary_color), accent_color = VALUES(accent_color)`,
      [content.brand.businessName, content.brand.logoUrl, content.brand.primaryColor, content.brand.accentColor],
    )
    await connection.query(
      `INSERT INTO contact (id, phone, email, address, whatsapp, instagram, facebook)
       VALUES (1, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE phone = VALUES(phone), email = VALUES(email), address = VALUES(address),
       whatsapp = VALUES(whatsapp), instagram = VALUES(instagram), facebook = VALUES(facebook)`,
      [
        content.contact.phone,
        content.contact.email,
        content.contact.address,
        content.contact.whatsapp,
        content.contact.instagram,
        content.contact.facebook,
      ],
    )

    const sectionKeys = content.sections.map((section) => section.id)
    if (sectionKeys.length) {
      await connection.query(
        `DELETE FROM sections WHERE section_key NOT IN (${sectionKeys.map(() => '?').join(', ')})`,
        sectionKeys,
      )
    } else {
      await connection.query('DELETE FROM sections')
    }

    for (const [index, section] of content.sections.entries()) {
      await connection.query(
        `INSERT INTO sections (section_key, label, description, enabled, content, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE label = VALUES(label), description = VALUES(description), enabled = VALUES(enabled),
         content = VALUES(content), sort_order = VALUES(sort_order)`,
        [section.id, section.label, section.description, section.enabled, JSON.stringify(section.content), index],
      )
      const [rows] = await connection.query<RowDataPacket[]>('SELECT id FROM sections WHERE section_key = ?', [section.id])
      const sectionId = Number(rows[0]?.id)
      await connection.query('DELETE FROM section_items WHERE section_id = ?', [sectionId])
      for (const [itemIndex, item] of section.items.entries()) {
        await connection.query(
          'INSERT INTO section_items (section_id, item_data, sort_order) VALUES (?, ?, ?)',
          [sectionId, JSON.stringify(item), itemIndex],
        )
      }
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const readGalleryRecords = async (fallbackFile: string): Promise<GalleryRecord[]> => {
  if (!pool) return readDocument<GalleryRecord[]>('gallery', fallbackFile, [])
  await ensureSchema()
  const [rows] = await pool.query<RowDataPacket[]>('SELECT image_url, alt FROM gallery_images ORDER BY sort_order, id')
  return rows.map((row) => ({ imageUrl: String(row.image_url), alt: String(row.alt ?? '') }))
}

export const writeGalleryRecords = async (records: GalleryRecord[], fallbackFile: string) => {
  if (!pool) {
    await writeDocument('gallery', records, fallbackFile)
    return
  }
  await ensureSchema()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.query('DELETE FROM gallery_images')
    for (const [index, record] of records.entries()) {
      await connection.query(
        'INSERT INTO gallery_images (image_url, alt, sort_order) VALUES (?, ?, ?)',
        [record.imageUrl, record.alt, index],
      )
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const readMessageRecords = async (fallbackFile: string): Promise<MessageRecord[]> => {
  if (!pool) return readDocument<MessageRecord[]>('messages', fallbackFile, [])
  await ensureSchema()
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, name, email, service, message, created_at, is_read FROM messages ORDER BY created_at DESC',
  )
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    service: String(row.service ?? ''),
    message: String(row.message),
    createdAt: new Date(row.created_at).toISOString(),
    read: Boolean(row.is_read),
  }))
}

export const writeMessageRecords = async (records: MessageRecord[], fallbackFile: string) => {
  if (!pool) {
    await writeDocument('messages', records, fallbackFile)
    return
  }
  await ensureSchema()
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.query('DELETE FROM messages')
    for (const record of records) {
      await connection.query(
        `INSERT INTO messages (id, name, email, service, message, created_at, is_read)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [record.id, record.name, record.email, record.service, record.message, new Date(record.createdAt), record.read],
      )
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const findUserByEmail = async (email: string, fallbackFile: string): Promise<UserRecord | null> => {
  if (!pool) {
    const users = await readDocument<UserRecord[]>('users', fallbackFile, [])
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  await ensureSchema()
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, email, password_hash, display_name, role, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1',
    [email],
  )
  const user = rows[0]
  if (!user) return null
  return {
    id: String(user.id),
    email: String(user.email),
    passwordHash: String(user.password_hash),
    displayName: String(user.display_name ?? ''),
    role: String(user.role),
    isActive: Boolean(user.is_active),
  }
}

export const syncConfiguredUser = async (user: UserRecord, fallbackFile: string) => {
  if (!pool) {
    const users = await readDocument<UserRecord[]>('users', fallbackFile, [])
    const existingIndex = users.findIndex((entry) => entry.email.toLowerCase() === user.email.toLowerCase())
    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...user,
        id: users[existingIndex]!.id,
        passwordHash: users[existingIndex]!.passwordHash,
      }
    }
    else users.push(user)
    await writeDocument('users', users, fallbackFile)
    return
  }

  await ensureSchema()
  await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role, is_active)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), role = VALUES(role), is_active = VALUES(is_active)`,
    [user.email, user.passwordHash, user.displayName, user.role, user.isActive],
  )
}

export const listUsers = async (fallbackFile: string): Promise<PublicUserRecord[]> => {
  if (!pool) {
    const users = await readDocument<UserRecord[]>('users', fallbackFile, [])
    return users.map(({ passwordHash: _passwordHash, ...user }) => user)
  }
  await ensureSchema()
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id, email, display_name, role, is_active FROM users ORDER BY display_name, email',
  )
  return rows.map((user) => ({
    id: String(user.id),
    email: String(user.email),
    displayName: String(user.display_name ?? ''),
    role: String(user.role),
    isActive: Boolean(user.is_active),
  }))
}

export const saveUser = async (user: UserRecord, fallbackFile: string) => {
  if (!pool) {
    const users = await readDocument<UserRecord[]>('users', fallbackFile, [])
    const existingIndex = users.findIndex((entry) => entry.id === user.id)
    if (existingIndex >= 0) users[existingIndex] = user
    else users.push(user)
    await writeDocument('users', users, fallbackFile)
    return
  }
  await ensureSchema()
  await pool.query(
    `INSERT INTO users (email, password_hash, display_name, role, is_active)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), role = VALUES(role), is_active = VALUES(is_active)`,
    [user.email, user.passwordHash, user.displayName, user.role, user.isActive],
  )
}

export const updateUser = async (
  id: string,
  values: { displayName?: string; role?: string; isActive?: boolean; passwordHash?: string },
  fallbackFile: string,
) => {
  if (!pool) {
    const users = await readDocument<UserRecord[]>('users', fallbackFile, [])
    const index = users.findIndex((user) => user.id === id)
    if (index < 0) throw new Error('User not found.')
    users[index] = { ...users[index]!, ...values }
    await writeDocument('users', users, fallbackFile)
    return
  }
  await ensureSchema()
  const fields: string[] = []
  const params: unknown[] = []
  if (values.displayName !== undefined) { fields.push('display_name = ?'); params.push(values.displayName) }
  if (values.role !== undefined) { fields.push('role = ?'); params.push(values.role) }
  if (values.isActive !== undefined) { fields.push('is_active = ?'); params.push(values.isActive) }
  if (values.passwordHash !== undefined) { fields.push('password_hash = ?'); params.push(values.passwordHash) }
  if (!fields.length) return
  await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [...params, id])
}

export const storePasswordResetToken = async (tokenHash: string, userId: string, expiresAt: Date) => {
  const db = await requirePool()
  await db.query('DELETE FROM password_reset_tokens WHERE user_id = ? OR expires_at < CURRENT_TIMESTAMP', [userId])
  await db.query(
    'INSERT INTO password_reset_tokens (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
    [tokenHash, userId, expiresAt],
  )
}

export const consumePasswordResetToken = async (tokenHash: string, passwordHash: string) => {
  const db = await requirePool()
  const connection = await db.getConnection()
  try {
    await connection.beginTransaction()
    const [rows] = await connection.query<RowDataPacket[]>(
      'SELECT user_id FROM password_reset_tokens WHERE token_hash = ? AND expires_at > CURRENT_TIMESTAMP FOR UPDATE',
      [tokenHash],
    )
    if (!rows[0]) return false
    await connection.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, rows[0].user_id])
    await connection.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [rows[0].user_id])
    await connection.commit()
    return true
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export const recordUserLogin = async (id: string) => {
  if (!pool) return
  await ensureSchema()
  await pool.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
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
