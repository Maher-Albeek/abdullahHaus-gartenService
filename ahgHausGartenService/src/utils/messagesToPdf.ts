export type PdfMessage = {
  name: string
  email: string
  service: string
  message: string
  createdAt: string
  read?: boolean
}

const ascii = (value: string) =>
  value
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .normalize('NFKD').replace(/[^\x20-\x7E]/g, '')

const escapePdf = (value: string) => ascii(value).replace(/([\\()])/g, '\\$1')
const text = (value: string, x: number, y: number, size = 10, bold = false, color = '0.20 0.23 0.19') =>
  `${color} rg BT /F${bold ? 2 : 1} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`
const rect = (x: number, y: number, width: number, height: number, color: string) =>
  `${color} rg ${x} ${y} ${width} ${height} re f`
const line = (x1: number, y1: number, x2: number, y2: number, color = '0.88 0.90 0.86') =>
  `${color} RG ${x1} ${y1} m ${x2} ${y2} l S`

const wrap = (value: string, length = 82) => {
  const lines: string[] = []
  for (const paragraph of value.split(/\r?\n/)) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    let current = ''
    for (const word of words) {
      if (`${current} ${word}`.trim().length > length && current) {
        lines.push(current)
        current = word
      } else current = `${current} ${word}`.trim()
    }
    lines.push(current)
  }
  return lines
}

const pageChrome = (title: string, subtitle: string, page: number, total: number) => [
  rect(0, 775, 595, 67, '0.18 0.36 0.10'),
  rect(0, 768, 595, 7, '0.52 0.16 0.20'),
  text('AHG', 42, 805, 20, true, '1 1 1'),
  text(title, 108, 808, 14, true, '1 1 1'),
  text(subtitle, 108, 790, 8, false, '0.88 0.94 0.85'),
  line(42, 48, 553, 48),
  text(`Seite ${page} von ${total}`, 495, 30, 8, false, '0.45 0.48 0.43'),
]

export const createMessagesPdfBlob = (messages: PdfMessage[]) => {
  const readCount = messages.filter((entry) => entry.read === true).length
  const totalPages = messages.length + 1
  const pages: string[][] = []
  const cover = pageChrome('Kontakt-Nachrichten', `Exportiert am ${new Date().toLocaleString('de-DE')}`, 1, totalPages)
  cover.push(
    text('Nachrichten-Uebersicht', 42, 715, 20, true),
    text('Alle Anfragen aus dem Kontaktformular in einem lesbaren Bericht.', 42, 690, 10, false, '0.42 0.46 0.40'),
    rect(42, 575, 155, 82, '0.94 0.97 0.92'),
    rect(220, 575, 155, 82, '0.94 0.97 0.92'),
    rect(398, 575, 155, 82, '1 0.95 0.95'),
    text(String(messages.length), 60, 615, 24, true, '0.18 0.36 0.10'),
    text('Gesamt', 60, 592, 9, true),
    text(String(readCount), 238, 615, 24, true, '0.18 0.36 0.10'),
    text('Gelesen', 238, 592, 9, true),
    text(String(messages.length - readCount), 416, 615, 24, true, '0.75 0.16 0.18'),
    text('Ungelesen', 416, 592, 9, true),
    text('Inhalt', 42, 515, 12, true),
  )
  messages.slice(0, 16).forEach((entry, index) => {
    const y = 488 - index * 25
    cover.push(text(`${index + 1}. ${entry.name}`, 48, y, 9, true))
    cover.push(text(new Date(entry.createdAt).toLocaleDateString('de-DE'), 455, y, 8, false, '0.45 0.48 0.43'))
    cover.push(line(42, y - 9, 553, y - 9))
  })
  pages.push(cover)

  messages.forEach((entry, index) => {
    const commands = pageChrome('Kontakt-Nachricht', `${index + 1} von ${messages.length} Nachrichten`, index + 2, totalPages)
    commands.push(
      rect(42, 690, 511, 50, entry.read === true ? '0.94 0.97 0.92' : '1 0.94 0.94'),
      text(entry.read === true ? 'GELESEN' : 'UNGELESEN', 58, 714, 9, true, entry.read === true ? '0.18 0.36 0.10' : '0.75 0.16 0.18'),
      text(new Date(entry.createdAt).toLocaleString('de-DE'), 375, 714, 9, false, '0.42 0.46 0.40'),
      text(entry.name, 42, 640, 19, true),
      text(entry.email, 42, 617, 10, false, '0.18 0.36 0.10'),
      text('Dienstleistung', 42, 570, 8, true, '0.45 0.48 0.43'),
      text(entry.service || 'Keine Angabe', 42, 550, 11, true),
      line(42, 525, 553, 525),
      text('Nachricht', 42, 495, 11, true),
    )
    wrap(entry.message).slice(0, 28).forEach((messageLine, lineIndex) => {
      commands.push(text(messageLine, 42, 470 - lineIndex * 15, 10))
    })
    pages.push(commands)
  })

  const pageObjectIds = pages.map((_, index) => 5 + index * 2)
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  pages.forEach((commands, index) => {
    const pageId = pageObjectIds[index]!
    const contentId = pageId + 1
    const content = commands.join('\n')
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`)
    objects.push(`<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`)
  })

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length)
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = new TextEncoder().encode(pdf).length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return new Blob([pdf], { type: 'application/pdf' })
}
