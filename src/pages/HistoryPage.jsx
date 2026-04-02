import React, { useState } from 'react'
import { useHistory } from '../context/HistoryContext'
import { Clock, FileText, Users, Trash2, ChevronDown, ChevronRight, Download } from 'lucide-react'

function HistoryEntry({ entry, isOpen, onToggle }) {
  const isJob = entry.type === 'job-offer'

  function downloadResult() {
    let content = ''
    if (isJob && entry.result) {
      content = `=== BIAS ANALYSIS ===\n${entry.result.biasAnalysis}\n\n=== FLAGGED WORDS ===\n${entry.result.flaggedWords}\n\n=== GENDER-NEUTRAL REWRITE ===\n${entry.result.genderNeutralRewrite}`
    }
    if (!content) return
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nubias_${entry.id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isJob ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'
        }`}>
          {isJob ? <FileText size={16} /> : <Users size={16} />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{entry.title}</p>
          <p className="text-xs text-slate-400">
            {isJob ? 'Job Offer' : `Application batch${entry.count ? ` · ${entry.count} file${entry.count > 1 ? 's' : ''}` : ''}`}
            {' · '}
            {new Date(entry.date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="badge bg-emerald-100 text-emerald-700">Processed</span>
          {isOpen ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50 p-5 space-y-3">
          {isJob && entry.result ? (
            <>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Flagged Words</p>
                <p className="text-sm text-slate-700 font-mono bg-rose-50 rounded-lg px-3 py-2 border border-rose-100">
                  {entry.result.flaggedWords || 'None'}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Bias Analysis (excerpt)</p>
                <p className="text-sm text-slate-700 line-clamp-3">{entry.result.biasAnalysis}</p>
              </div>
              <button
                onClick={downloadResult}
                className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:text-brand-800 font-medium"
              >
                <Download size={12} />
                Download full report
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              {entry.count} document{entry.count > 1 ? 's' : ''} anonymised.
              {' '}Result data is not stored for privacy compliance.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const { history, clearHistory } = useHistory()
  const [openId, setOpenId] = useState(null)
  const [filter, setFilter] = useState('all') // 'all' | 'job-offer' | 'application'

  const filtered = history.filter(h => filter === 'all' || h.type === filter)

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <Clock size={18} className="text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Document History</h1>
            </div>
            <p className="text-slate-500 text-sm ml-11">
              {history.length} document{history.length !== 1 ? 's' : ''} processed
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => { if (window.confirm('Clear all history? This cannot be undone.')) clearHistory() }}
              className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 font-medium"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'All' },
            { id: 'job-offer', label: 'Job Offers' },
            { id: 'application', label: 'Applications' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === id
                  ? 'bg-brand-700 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
              }`}
            >
              {label}
              {id !== 'all' && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === id ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {history.filter(h => h.type === id).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Clock size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No documents in history yet.</p>
            <p className="text-slate-300 text-xs mt-1">
              Process a job offer or application to see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(entry => (
              <HistoryEntry
                key={entry.id}
                entry={entry}
                isOpen={openId === entry.id}
                onToggle={() => setOpenId(openId === entry.id ? null : entry.id)}
              />
            ))}
          </div>
        )}

        <div className="mt-8 rounded-xl bg-slate-100 px-5 py-4 text-xs text-slate-500">
          <strong className="text-slate-700">Privacy note:</strong> Document history is stored locally in your browser only.
          No data is sent to Nubias servers. Original CVs are never stored — only anonymised references.
          Clear history at any time using the button above.
        </div>
      </div>
    </div>
  )
}
