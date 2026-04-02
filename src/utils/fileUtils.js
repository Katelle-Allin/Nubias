/**
 * File utilities — read PDF/DOCX/TXT, generate DOCX/PDF downloads
 */

// ── Reading ────────────────────────────────────────────────────────────────

/**
 * Extract plain text from a File object (.pdf, .docx, .doc, .txt).
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'txt') {
    return file.text()
  }

  if (ext === 'pdf') {
    return extractFromPDF(file)
  }

  if (ext === 'docx' || ext === 'doc') {
    return extractFromDocx(file)
  }

  throw new Error(`Unsupported file type: .${ext}. Please use PDF, DOCX, or TXT.`)
}

async function extractFromPDF(file) {
  const pdfjsLib = await import('pdfjs-dist')

  // Use CDN worker matching the installed pdfjs-dist version (avoids Vite worker bundling issues)
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
  }

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise

  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    // Join items preserving line breaks via transform y-position changes
    let lastY = null
    const lineChunks = []
    for (const item of content.items) {
      if ('str' in item) {
        const y = item.transform[5]
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          lineChunks.push('\n')
        }
        lineChunks.push(item.str)
        lastY = y
      }
    }
    pages.push(lineChunks.join(''))
  }

  return pages.join('\n\n')
}

async function extractFromDocx(file) {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// ── Writing / Download ─────────────────────────────────────────────────────

/**
 * Download text as a formatted .docx Word document.
 * @param {string} text
 * @param {string} filename  (without extension)
 * @param {string} [title]   Optional document title shown at top
 */
export async function downloadAsDocx(text, filename, title) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx')

  const children = []

  if (title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: title, bold: true })],
      })
    )
    children.push(new Paragraph({ children: [new TextRun('')] })) // spacer
  }

  const lines = text.split('\n')
  for (const line of lines) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: line || '' })],
      })
    )
  }

  const doc = new Document({
    sections: [{ children }],
  })

  const blob = await Packer.toBlob(doc)
  triggerDownload(blob, `${filename}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
}

/**
 * Download text as a .pdf file.
 * @param {string} text
 * @param {string} filename  (without extension)
 * @param {string} [title]   Optional title shown at top of PDF
 */
export async function downloadAsPdf(text, filename, title) {
  const jspdfModule = await import('jspdf')
  // jspdf 4.x exports jsPDF as default; 2.x exports as named
  const jsPDF = jspdfModule.jsPDF ?? jspdfModule.default?.jsPDF ?? jspdfModule.default

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 15
  const usableW = pageW - margin * 2
  let y = margin

  // Title
  if (title) {
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(title, margin, y)
    y += 8
    doc.setFont('helvetica', 'normal')
  }

  doc.setFontSize(10)

  const lines = text.split('\n')
  for (const rawLine of lines) {
    const wrapped = doc.splitTextToSize(rawLine || ' ', usableW)
    for (const wLine of wrapped) {
      if (y + 5 > pageH - margin) {
        doc.addPage()
        y = margin
      }
      doc.text(wLine, margin, y)
      y += 5
    }
  }

  doc.save(`${filename}.pdf`)
}

/**
 * Download text as a plain .txt file.
 */
export function downloadAsTxt(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  triggerDownload(blob, `${filename}.txt`, 'text/plain')
}

function triggerDownload(blob, filename, mimeType) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
