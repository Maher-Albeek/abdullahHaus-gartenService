import { describe, expect, it } from 'vitest'
import { createMessagesPdfBlob } from '../utils/messagesToPdf'

describe('createMessagesPdfBlob', () => {
  it('creates a PDF containing exported message text', async () => {
    const blob = createMessagesPdfBlob([{
      name: 'Max Mustermann',
      email: 'max@example.com',
      service: 'Gartenpflege',
      message: 'Bitte um Rückruf.',
      createdAt: '2026-06-11T10:00:00.000Z',
      read: false,
    }])
    const content = await blob.text()

    expect(blob.type).toBe('application/pdf')
    expect(content.startsWith('%PDF-1.4')).toBe(true)
    expect(content).toContain('Max Mustermann')
    expect(content).toContain('Bitte um Rueckruf.')
    expect(content).toContain('Nachrichten-Uebersicht')
    expect(content).toContain('UNGELESEN')
  })
})
