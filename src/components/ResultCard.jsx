import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function ResultCard({ title, content, accent = 'slate', badge }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accentMap = {
    slate:   'border-slate-200 bg-slate-50',
    rose:    'border-rose-200 bg-rose-50',
    emerald: 'border-emerald-200 bg-emerald-50',
    violet:  'border-violet-200 bg-violet-50',
    amber:   'border-amber-200 bg-amber-50',
  }

  const titleMap = {
    slate:   'text-slate-800',
    rose:    'text-rose-800',
    emerald: 'text-emerald-800',
    violet:  'text-violet-800',
    amber:   'text-amber-800',
  }

  return (
    <div className={`rounded-2xl border p-5 ${accentMap[accent]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`font-semibold text-sm ${titleMap[accent]}`}>{title}</h3>
          {badge && (
            <span className={`badge ${
              accent === 'rose'    ? 'bg-rose-100 text-rose-700' :
              accent === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
              accent === 'violet'  ? 'bg-violet-100 text-violet-700' :
              'bg-slate-100 text-slate-600'
            }`}>
              {badge}
            </span>
          )}
        </div>
        {content && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors px-2 py-1 rounded-lg hover:bg-white"
          >
            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed max-h-64 overflow-y-auto">
        {content || <span className="text-slate-400 italic">No output yet</span>}
      </pre>
    </div>
  )
}
