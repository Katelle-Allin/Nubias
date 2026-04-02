import React from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'

export default function AIDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div className="flex items-start gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-500" />
        <p>
          <span className="font-semibold">AI Notice:</span> These outputs are AI-generated suggestions. A human must review and validate all content before use in any hiring decision.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle size={18} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-amber-900 mb-1">AI Transparency Notice</h3>
          <ul className="space-y-1 text-sm text-amber-800">
            <li>• This content was produced by an AI model (Hugging Face SLM, ≤1B parameters).</li>
            <li>• AI outputs are <strong>suggestions only</strong> — not decisions or authoritative versions.</li>
            <li>• All outputs <strong>must be reviewed and validated by a human</strong> before use in any hiring decision.</li>
            <li>• The model may make errors or miss context. Human judgement is required.</li>
          </ul>
          <a
            href="https://huggingface.co/ano666"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs text-amber-700 hover:text-amber-900 underline"
          >
            View model card on Hugging Face <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  )
}
