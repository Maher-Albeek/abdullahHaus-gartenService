import { describe, expect, it } from 'vitest'
import { imgToAvif } from '../utils/imgToAvif'

describe('imgToAvif', () => {
  it('rejects empty input', async () => {
    await expect(imgToAvif(new Blob())).rejects.toThrow(
      'imgToAvif requires a non-empty File or Blob.',
    )
  })

  it('rejects unsupported non-image files', async () => {
    const input = new File(['hello'], 'notes.txt', { type: 'text/plain' })

    await expect(imgToAvif(input)).rejects.toThrow('Unsupported format "text/plain".')
  })

  it('validates quality before decoding input', async () => {
    const input = new File(['not-an-image'], 'photo.png', { type: 'image/png' })

    await expect(imgToAvif(input, { quality: 101 })).rejects.toThrow(
      'quality must be between 0 and 100.',
    )
  })
})
