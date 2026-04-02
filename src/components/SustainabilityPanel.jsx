import React, { useState } from 'react'
import { Leaf, ChevronDown, ChevronUp } from 'lucide-react'

export default function SustainabilityPanel({ sustainability, sessionTotals, requestHistory }) {
  const [open, setOpen] = useState(false)

  if (!sustainability && !sessionTotals) return null

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-emerald-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Leaf size={15} className="text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-800">♻️ Sustainability Footprint</span>
        </div>
        {open ? <ChevronUp size={15} className="text-emerald-600" /> : <ChevronDown size={15} className="text-emerald-600" />}
      </button>

      {/* Expandable details */}
      {open && (
        <div className="px-5 pb-5 space-y-3 border-t border-emerald-200">
          {sustainability && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mt-3 mb-1.5">This request</p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-3 border border-emerald-100">
                {sustainability}
              </pre>
            </div>
          )}
          {sessionTotals && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Session totals</p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-3 border border-emerald-100">
                {sessionTotals}
              </pre>
            </div>
          )}
          {requestHistory && (
            <div>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Request history</p>
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed bg-white rounded-xl p-3 border border-emerald-100 max-h-40 overflow-y-auto">
                {requestHistory}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
