import { encode } from '@jsquash/avif'

export interface ImgToAvifOptions {
  /**
   * Output quality from 0 (smallest file) to 100 (best quality).
   * Ignored when lossless is true.
   */
  quality?: number
  lossless?: boolean
  /**
   * PDF pages to convert. Page numbers start at 1.
   */
  pdfPages?: 'all' | number[]
  pdfScale?: number
  /**
   * Shrinks oversized images while preserving their aspect ratio.
   */
  maxDimension?: number
}

const DEFAULT_OPTIONS: Required<ImgToAvifOptions> = {
  quality: 75,
  lossless: false,
  pdfPages: 'all',
  pdfScale: 2,
  maxDimension: 4096,
}

function validateOptions(options: Required<ImgToAvifOptions>) {
  if (options.quality < 0 || options.quality > 100) {
    throw new RangeError('quality must be between 0 and 100.')
  }
  if (options.pdfScale <= 0) {
    throw new RangeError('pdfScale must be greater than 0.')
  }
  if (options.maxDimension <= 0) {
    throw new RangeError('maxDimension must be greater than 0.')
  }
}

function getBaseName(input: Blob) {
  const name = input instanceof File ? input.name : 'image'
  return name.replace(/\.[^.]+$/, '') || 'image'
}

function getOutputSize(width: number, height: number, maxDimension: number) {
  const ratio = Math.min(1, maxDimension / Math.max(width, height))

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  }
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) {
    throw new Error('Your browser does not support 2D canvas rendering.')
  }

  return { canvas, context }
}

async function canvasToAvifFile(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  filename: string,
  options: Required<ImgToAvifOptions>,
) {
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = await encode(imageData, {
    quality: options.quality,
    qualityAlpha: options.quality,
    lossless: options.lossless,
  })

  return new File([data], filename, { type: 'image/avif' })
}

async function imageToAvif(input: Blob, options: Required<ImgToAvifOptions>) {
  let source: CanvasImageSource
  let sourceWidth: number
  let sourceHeight: number
  let cleanup: () => void = () => undefined

  try {
    if (typeof createImageBitmap === 'function') {
      const bitmap = await createImageBitmap(input)
      source = bitmap
      sourceWidth = bitmap.width
      sourceHeight = bitmap.height
      cleanup = () => bitmap.close()
    } else {
      const image = new Image()
      const imageUrl = URL.createObjectURL(input)
      image.decoding = 'async'
      image.src = imageUrl
      await image.decode()
      source = image
      sourceWidth = image.naturalWidth
      sourceHeight = image.naturalHeight
      cleanup = () => URL.revokeObjectURL(imageUrl)
    }
  } catch {
    throw new TypeError(
      `Unsupported image format "${input.type || 'unknown'}". The browser could not decode it.`,
    )
  }

  try {
    const size = getOutputSize(sourceWidth, sourceHeight, options.maxDimension)
    const { canvas, context } = createCanvas(size.width, size.height)
    context.drawImage(source, 0, 0, size.width, size.height)

    return [
      await canvasToAvifFile(canvas, context, `${getBaseName(input)}.avif`, options),
    ]
  } finally {
    cleanup()
  }
}

function resolvePdfPages(numberOfPages: number, requestedPages: 'all' | number[]) {
  if (requestedPages === 'all') {
    return Array.from({ length: numberOfPages }, (_, index) => index + 1)
  }

  const pages = [...new Set(requestedPages)]
  if (
    pages.length === 0 ||
    pages.some((page) => !Number.isInteger(page) || page < 1 || page > numberOfPages)
  ) {
    throw new RangeError(`pdfPages must contain page numbers between 1 and ${numberOfPages}.`)
  }

  return pages
}

async function pdfToAvif(input: Blob, options: Required<ImgToAvifOptions>) {
  const [{ getDocument, GlobalWorkerOptions }, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ])
  GlobalWorkerOptions.workerSrc = worker.default

  const loadingTask = getDocument({ data: new Uint8Array(await input.arrayBuffer()) })
  const pdf = await loadingTask.promise

  try {
    const pages = resolvePdfPages(pdf.numPages, options.pdfPages)
    const files: File[] = []

    for (const pageNumber of pages) {
      const page = await pdf.getPage(pageNumber)
      const initialViewport = page.getViewport({ scale: options.pdfScale })
      const size = getOutputSize(
        initialViewport.width,
        initialViewport.height,
        options.maxDimension,
      )
      const viewport = page.getViewport({
        scale: options.pdfScale * (size.width / initialViewport.width),
      })
      const { canvas, context } = createCanvas(size.width, size.height)

      await page.render({
        canvas,
        canvasContext: context,
        viewport,
        background: '#ffffff',
      }).promise

      files.push(
        await canvasToAvifFile(
          canvas,
          context,
          `${getBaseName(input)}-page-${pageNumber}.avif`,
          options,
        ),
      )
      page.cleanup()
    }

    return files
  } finally {
    await loadingTask.destroy()
  }
}

/**
 * Converts a browser-decodable image or PDF into AVIF files.
 * Images return one file; PDFs return one file for each selected page.
 */
export async function imgToAvif(input: Blob, userOptions: ImgToAvifOptions = {}) {
  if (!(input instanceof Blob) || input.size === 0) {
    throw new TypeError('imgToAvif requires a non-empty File or Blob.')
  }

  const options = { ...DEFAULT_OPTIONS, ...userOptions }
  validateOptions(options)

  if (input.type === 'application/pdf') {
    return pdfToAvif(input, options)
  }

  if (input.type.startsWith('image/') || input.type === '') {
    return imageToAvif(input, options)
  }

  throw new TypeError(
    `Unsupported format "${input.type}". imgToAvif accepts PDFs and browser-decodable images.`,
  )
}
