import React, { useState } from 'react'
import { detectBias } from '../api/nubias'
import { useHistory } from '../context/HistoryContext'
import { downloadAsDocx, downloadAsPdf, downloadAsTxt } from '../utils/fileUtils'
import AIDisclaimer from '../components/AIDisclaimer'
import ResultCard from '../components/ResultCard'
import SustainabilityPanel from '../components/SustainabilityPanel'
import { FileText, Wand2, RotateCcw, Copy, Check, Info, ChevronDown, Download } from 'lucide-react'

const EXAMPLE = `We are looking for a competitive, driven software engineer to join our high-performance team. The ideal candidate is an aggressive self-starter who thrives in a fast-paced, results-oriented environment. You will dominate complex technical challenges and be a rockstar contributor.

Requirements:
- Strong analytical and problem-solving skills
- Experience with agile and fast-moving teams
- Ability to work independently and lead projects
- Competitive salary package`

function DownloadMenu({ onDocx, onPdf, onTxt }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition-colors"
      >
        <Download size={13} />
        Download rewrite
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-slate-100 shadow-lg py-1 z-20">
          {[
            { label: 'Word (.docx)', icon: '📝', action: () => { onDocx(); setOpen(false) } },
            { label: 'PDF (.pdf)',   icon: '📄', action: () => { onPdf();  setOpen(false) } },
            { label: 'Text (.txt)', icon: '📃', action: () => { onTxt();  setOpen(false) } },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
              <span>{icon}</span>{label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NeutralityBar({ score }) {
  // score: 0-100 (100 = perfectly neutral)
  const color = score > 70 ? 'bg-emerald-500' : score > 40 ? 'bg-amber-400' : 'bg-rose-500'
  const label = score > 70 ? 'Good' : score > 40 ? 'Moderate bias' : 'High bias'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 font-medium">Neutrality score</span>
        <span className={`font-semibold ${score > 70 ? 'text-emerald-700' : score > 40 ? 'text-amber-700' : 'text-rose-700'}`}>
          {label} ({score}/100)
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function JobOfferPage() {
  const { addEntry } = useHistory()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(null)
  const [copied, setCopied] = useState(false)

  // Rough neutrality score from flagged words count
  function computeScore(flaggedWords) {
    if (!flaggedWords) return 85
    const count = (flaggedWords.match(/,/g) || []).length + 1
    if (flaggedWords.trim() === '' || flaggedWords.toLowerCase().includes('none') || flaggedWords.toLowerCase().includes('no ')) return 90
    return Math.max(10, 85 - count * 8)
  }

  async function handleAnalyse() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    setProgress('Sending to AI…')

    try {
      const data = await detectBias(text, (msg) => setProgress(msg === 'processing' ? 'AI is processing…' : msg))
      setResult(data)
      addEntry({
        type: 'job-offer',
        title: text.trim().split('\n')[0].slice(0, 60) || 'Job Offer',
        result: data,
      })
    } catch (err) {
      setError(err.message || 'Failed to reach the AI model. Please check your connection.')
    } finally {
      setLoading(false)
      setProgress(null)
    }
  }

  function handleReset() {
    setText('')
    setResult(null)
    setError(null)
  }

  async function handleCopyRewrite() {
    await navigator.clipboard.writeText(result.genderNeutralRewrite)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const score = result ? computeScore(result.flaggedWords) : null
  const rewriteScore = result ? Math.min(95, score + 40) : null

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
              <FileText size={18} className="text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Job Offer Module</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">
            Paste a job posting to detect gendered language and receive a gender-neutral rewrite.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input panel */}
          <div className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-700">Job posting text</label>
                <button
                  onClick={() => setText(EXAMPLE)}
                  className="text-xs text-brand-600 hover:underline font-medium"
                >
                  Load example
                </button>
              </div>
              <textarea
                className="textarea-field font-mono text-xs leading-relaxed"
                rows={18}
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your job posting here…

Include the full text — job title, requirements, responsibilities, and company description. The AI will analyse all content for gendered language."
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">{text.length} characters</span>
                {result && (
                  <NeutralityBar score={score} />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAnalyse}
                disabled={loading || !text.trim()}
                className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {progress || 'Analysing…'}
                  </>
                ) : (
                  <><Wand2 size={16} /> Analyse & Rewrite</>
                )}
              </button>
              <button
                onClick={handleReset}
                className="btn-ghost"
              >
                <RotateCcw size={15} />
              </button>
            </div>

            <AIDisclaimer compact />

            <div className="flex items-start gap-2 text-xs text-slate-500 px-1">
              <Info size={13} className="shrink-0 mt-0.5 text-slate-400" />
              <p>
                Powered by <strong>madeofstone-nubiasv2.hf.space</strong> · SLM ≤5B parameters ·
                Calls: <code className="text-brand-600">/bias_detection</code>
              </p>
            </div>
          </div>

          {/* Results panel */}
          <div className="space-y-4">
            {!result && !error && !loading && (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <FileText size={36} className="text-slate-200 mb-3" />
                <p className="text-slate-400 text-sm">Paste a job posting and click <strong>Analyse & Rewrite</strong>.</p>
                <p className="text-slate-300 text-xs mt-1">Results appear here in real time.</p>
              </div>
            )}

            {loading && (
              <div className="card p-10 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin mx-auto mb-4" />
                <p className="text-slate-500 text-sm font-medium">{progress || 'Analysing…'}</p>
                <p className="text-slate-400 text-xs mt-1">The AI is processing your job posting — this can take up to a few minutes if the model is waking up</p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
                <p className="font-semibold text-rose-800 mb-1">Could not reach AI model</p>
                <p className="text-sm text-rose-700">{error}</p>
                <p className="text-xs text-rose-600 mt-2">
                  Make sure the Hugging Face space <code>madeofstone-nubiasv2.hf.space</code> is running and accessible.
                </p>
              </div>
            )}

            {result && (
              <div className="space-y-4 fade-in-up">
                {/* Neutrality scores */}
                <div className="card p-5 space-y-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Neutrality scores</p>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Original posting</p>
                    <NeutralityBar score={score} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">After rewrite</p>
                    <NeutralityBar score={rewriteScore} />
                  </div>
                </div>

                <ResultCard
                  title="Bias Analysis"
                  content={result.biasAnalysis}
                  accent="slate"
                  badge="AI generated"
                />
                <ResultCard
                  title="Flagged Words"
                  content={result.flaggedWords}
                  accent="rose"
                  badge="Review required"
                />
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-emerald-800">Gender-Neutral Rewrite</h3>
                      <span className="badge bg-emerald-100 text-emerald-700">Suggested draft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyRewrite}
                        className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-800 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                      </button>
                      <DownloadMenu
                        onDocx={() => downloadAsDocx(result.genderNeutralRewrite, 'nubias_rewrite', 'Gender-Neutral Job Posting Rewrite')}
                        onPdf={() => downloadAsPdf(result.genderNeutralRewrite, 'nubias_rewrite', 'Gender-Neutral Job Posting Rewrite')}
                        onTxt={() => downloadAsTxt(result.genderNeutralRewrite, 'nubias_rewrite')}
                      />
                    </div>
                  </div>
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-72 overflow-y-auto">
                    {result.genderNeutralRewrite}
                  </pre>
                  <div className="mt-4 pt-3 border-t border-emerald-200">
                    <p className="text-xs text-emerald-700">
                      ⚠ This rewrite is an AI suggestion. Review all changes before using in any recruitment context.
                    </p>
                  </div>
                </div>

                <SustainabilityPanel
                  sustainability={result.sustainability}
                  sessionTotals={result.sessionTotals}
                  requestHistory={result.requestHistory}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
