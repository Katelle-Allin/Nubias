import React, { useState, useRef } from 'react'
import { anonymizeDocument } from '../api/nubias'
import { useHistory } from '../context/HistoryContext'
import { extractTextFromFile, downloadAsDocx, downloadAsPdf, downloadAsTxt } from '../utils/fileUtils'
import AIDisclaimer from '../components/AIDisclaimer'
import { Users, Upload, Wand2, RotateCcw, FileText, X, Info, Download, FileCheck, ChevronDown } from 'lucide-react'

const EXAMPLE = `Dear Hiring Manager,

My name is Sarah Johnson and I am applying for the Senior Product Manager position. I have spent the last five years at TechCorp where I helped build the product team from scratch and supported the growth of our user base to over 2 million active users. As a woman in tech, I have always been passionate about fostering collaborative environments.

Throughout my career, I have assisted cross-functional teams in delivering impactful products on time. I am warm, empathetic, and believe strongly in nurturing talent within teams. My pronouns are she/her.

I hold a BSc in Computer Science from the University of Edinburgh and an MBA from London Business School.

Sincerely,
Sarah Johnson`

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.txt'
const FORMAT_ICONS = { pdf: '📄', docx: '📝', doc: '📝', txt: '📃' }
const FORMAT_COLORS = {
  pdf:  'bg-red-50 text-red-700 border-red-200',
  docx: 'bg-blue-50 text-blue-700 border-blue-200',
  doc:  'bg-blue-50 text-blue-700 border-blue-200',
  txt:  'bg-slate-50 text-slate-700 border-slate-200',
}

function FileTag({ name, ext, onRemove }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium ${FORMAT_COLORS[ext] ?? FORMAT_COLORS.txt}`}>
      <span>{FORMAT_ICONS[ext] ?? '📄'}</span>
      <span className="truncate max-w-[160px]">{name}</span>
      <button onClick={onRemove} className="ml-1 opacity-60 hover:opacity-100">
        <X size={13} />
      </button>
    </div>
  )
}

function DownloadMenu({ onDownloadDocx, onDownloadPdf, onDownloadTxt, loading }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-700 text-white text-xs font-semibold hover:bg-brand-800 transition-colors disabled:opacity-50"
      >
        <Download size={13} />
        Download
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-20">
          {[
            { label: 'Word (.docx)', icon: '📝', action: () => { onDownloadDocx(); setOpen(false) } },
            { label: 'PDF (.pdf)',   icon: '📄', action: () => { onDownloadPdf();  setOpen(false) } },
            { label: 'Text (.txt)', icon: '📃', action: () => { onDownloadTxt();  setOpen(false) } },
          ].map(({ label, icon, action }) => (
            <button
              key={label}
              onClick={action}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ApplicationsPage() {
  const { addEntry } = useHistory()
  const fileInputRef = useRef(null)

  const [mode, setMode] = useState('upload') // 'paste' | 'upload'
  const [pasteText, setPasteText] = useState('')
  const [files, setFiles] = useState([]) // [{ name, ext, text }]
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [progress, setProgress] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [extracting, setExtracting] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)

  // ── File handling ──────────────────────────────────────────────────────

  async function handleFileSelect(e) {
    const selected = Array.from(e.target.files || e.dataTransfer?.files || [])
    if (!selected.length) return
    setExtracting(true)
    setError(null)

    const extracted = []
    for (const file of selected) {
      const ext = file.name.split('.').pop().toLowerCase()
      try {
        const text = await extractTextFromFile(file)
        extracted.push({ name: file.name, ext, text })
      } catch (err) {
        setError(`Could not read "${file.name}": ${err.message}`)
      }
    }

    setFiles(prev => [...prev, ...extracted])
    setExtracting(false)
    e.target.value = ''
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFileSelect({ target: { files: e.dataTransfer.files } })
  }

  function removeFile(idx) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Processing ─────────────────────────────────────────────────────────

  async function handleProcess() {
    const docs = mode === 'paste'
      ? [{ name: 'pasted-document.txt', ext: 'txt', text: pasteText }]
      : files

    if (!docs.length || (mode === 'paste' && !pasteText.trim())) return

    setLoading(true)
    setError(null)
    setResults([])
    setProgress('Preparing documents…')

    try {
      const processed = []
      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]
        setProgress(`Anonymising document ${i + 1} of ${docs.length}: ${doc.name}`)
        const data = await anonymizeDocument(doc.text, (msg) => {
          if (msg === 'processing') setProgress(`AI anonymising "${doc.name}"…`)
        })
        processed.push({
          originalName: doc.name,
          originalExt: doc.ext,
          anonId: `application_${String(i + 1).padStart(3, '0')}`,
          surfaceAnonymized: data.surfaceAnonymized,
          fullyAnonymized: data.fullyAnonymized,
        })
      }
      setResults(processed)
      setActiveIdx(0)
      addEntry({
        type: 'application',
        title: `Batch · ${docs.length} document${docs.length > 1 ? 's' : ''}`,
        count: docs.length,
      })
    } catch (err) {
      setError(err.message || 'Failed to reach the AI model.')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  function handleReset() {
    setPasteText('')
    setFiles([])
    setResults([])
    setError(null)
  }

  // ── Downloads ──────────────────────────────────────────────────────────

  async function downloadResult(result, version, format) {
    const text = version === 'surface' ? result.surfaceAnonymized : result.fullyAnonymized
    const label = version === 'surface' ? 'surface-anonymised' : 'fully-anonymised'
    const filename = `${result.anonId}_${label}`
    const docTitle = `${result.anonId} — ${version === 'surface' ? 'Surface Anonymised' : 'Fully Anonymised'}`

    setDownloadLoading(true)
    try {
      if (format === 'docx') await downloadAsDocx(text, filename, docTitle)
      else if (format === 'pdf') await downloadAsPdf(text, filename, docTitle)
      else downloadAsTxt(text, filename)
    } catch (err) {
      setError(`Download failed: ${err.message}`)
    } finally {
      setDownloadLoading(false)
    }
  }

  function downloadMappingCsv() {
    const rows = [['Anonymised ID', 'Original filename', 'Original format']]
    results.forEach(r => rows.push([r.anonId, r.originalName, r.originalExt.toUpperCase()]))
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nubias_identity_mapping.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const active = results[activeIdx]
  const canProcess = mode === 'paste' ? pasteText.trim().length > 0 : files.length > 0

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Users size={18} className="text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Applications Module</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">
            Upload candidate CVs or cover letters (PDF, DOCX, TXT) for blind anonymisation. Download results in the same format.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Input panel ── */}
          <div className="space-y-4">
            {/* Mode tabs */}
            <div className="card p-1 flex gap-1">
              {[
                { id: 'upload', label: 'Upload files' },
                { id: 'paste', label: 'Paste text' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    mode === id ? 'bg-brand-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Upload mode */}
            {mode === 'upload' && (
              <>
                {/* Drop zone */}
                <div
                  className={`card p-8 text-center border-2 border-dashed transition-colors cursor-pointer
                    ${extracting ? 'border-brand-300 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-brand-50/30'}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  {extracting ? (
                    <>
                      <div className="w-8 h-8 rounded-full border-3 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-3" />
                      <p className="text-sm text-brand-700 font-medium">Reading file…</p>
                    </>
                  ) : (
                    <>
                      <Upload size={28} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600 mb-1">
                        Drop files here or <span className="text-brand-600 underline">browse</span>
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                        {['PDF', 'DOCX', 'DOC', 'TXT'].map(f => (
                          <span key={f} className="badge bg-slate-100 text-slate-600">{f}</span>
                        ))}
                      </div>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES}
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* File list */}
                {files.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                      {files.length} file{files.length > 1 ? 's' : ''} ready
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {files.map((f, i) => (
                        <FileTag key={i} name={f.name} ext={f.ext} onRemove={() => removeFile(i)} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Paste mode */}
            {mode === 'paste' && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">CV / Cover letter text</label>
                  <button
                    onClick={() => setPasteText(EXAMPLE)}
                    className="text-xs text-brand-600 hover:underline font-medium"
                  >
                    Load example
                  </button>
                </div>
                <textarea
                  className="textarea-field font-mono text-xs leading-relaxed"
                  rows={16}
                  value={pasteText}
                  onChange={e => setPasteText(e.target.value)}
                  placeholder="Paste a CV or cover letter here…"
                />
                <p className="text-xs text-slate-400 mt-2">{pasteText.length} characters</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleProcess}
                disabled={loading || !canProcess || extracting}
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {progress || 'Processing…'}
                  </>
                ) : (
                  <><Wand2 size={16} /> Anonymise</>
                )}
              </button>
              <button onClick={handleReset} className="btn-ghost" title="Reset">
                <RotateCcw size={15} />
              </button>
            </div>

            <AIDisclaimer compact />

            <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
              <Info size={13} className="shrink-0 mt-0.5 text-slate-400" />
              <p>
                Calls <code className="text-brand-600">/anonymize</code> on{' '}
                <strong>ano666-nubias.hf.space</strong> ·
                PDF and DOCX text is extracted locally in your browser before sending.
              </p>
            </div>
          </div>

          {/* ── Results panel ── */}
          <div className="space-y-4">
            {!results.length && !error && !loading && (
              <div className="card p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
                <Users size={36} className="text-slate-200 mb-3" />
                <p className="text-slate-400 text-sm">Upload documents and click <strong>Anonymise</strong>.</p>
                <p className="text-slate-300 text-xs mt-1">Two anonymisation levels will appear here.</p>
              </div>
            )}

            {loading && (
              <div className="card p-10 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-600 text-sm font-semibold">{progress || 'Processing…'}</p>
                <p className="text-slate-400 text-xs mt-1">Removing identifying information</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                <p className="font-semibold text-rose-800 mb-1">Error</p>
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4 fade-in-up">
                {/* Doc selector */}
                {results.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {results.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          activeIdx === i
                            ? 'bg-brand-700 text-white border-brand-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300'
                        }`}
                      >
                        <span>{FORMAT_ICONS[r.originalExt] ?? '📄'}</span>
                        {r.anonId}
                      </button>
                    ))}
                  </div>
                )}

                {/* Identity mapping banner */}
                {active && (
                  <div className="rounded-xl bg-slate-900 text-white px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Identity mapping</p>
                        <p className="text-sm truncate">
                          <code className="text-emerald-400 font-mono">{active.anonId}</code>
                          <span className="text-slate-500 mx-2">→</span>
                          <span className="text-slate-300">{active.originalName}</span>
                        </p>
                      </div>
                      <button
                        onClick={downloadMappingCsv}
                        className="shrink-0 flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        <Download size={12} />
                        CSV map
                      </button>
                    </div>
                  </div>
                )}

                {/* Surface anonymised */}
                {active && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <FileCheck size={15} className="text-slate-500" />
                          <h3 className="font-semibold text-sm text-slate-800">Surface Anonymised</h3>
                          <span className="badge bg-slate-100 text-slate-600">Level 1</span>
                        </div>
                        <p className="text-xs text-slate-400 ml-5">Names, pronouns, and titles removed</p>
                      </div>
                      <DownloadMenu
                        loading={downloadLoading}
                        onDownloadDocx={() => downloadResult(active, 'surface', 'docx')}
                        onDownloadPdf={() => downloadResult(active, 'surface', 'pdf')}
                        onDownloadTxt={() => downloadResult(active, 'surface', 'txt')}
                      />
                    </div>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto bg-slate-50 rounded-xl p-3">
                      {active.surfaceAnonymized || <span className="text-slate-400 italic">No output</span>}
                    </pre>
                  </div>
                )}

                {/* Fully anonymised */}
                {active && (
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <FileCheck size={15} className="text-violet-600" />
                          <h3 className="font-semibold text-sm text-violet-800">Fully Anonymised</h3>
                          <span className="badge bg-violet-100 text-violet-700">Level 2</span>
                        </div>
                        <p className="text-xs text-violet-600 ml-5">Gendered style words also neutralised</p>
                      </div>
                      <DownloadMenu
                        loading={downloadLoading}
                        onDownloadDocx={() => downloadResult(active, 'full', 'docx')}
                        onDownloadPdf={() => downloadResult(active, 'full', 'pdf')}
                        onDownloadTxt={() => downloadResult(active, 'full', 'txt')}
                      />
                    </div>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto bg-white rounded-xl p-3">
                      {active.fullyAnonymized || <span className="text-slate-400 italic">No output</span>}
                    </pre>
                    <p className="text-xs text-violet-700 mt-3 border-t border-violet-200 pt-3">
                      ⚠ AI suggestion — review before using in any blind shortlisting process.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
