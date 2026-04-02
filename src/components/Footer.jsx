import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Nubias</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Gender-neutral hiring platform grounded in peer-reviewed research. Making bias visible — and fixable.
            </p>
            <p className="text-xs mt-4 text-slate-500">
              Academic project · Version 1.0 · 2026
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/job-offer" className="hover:text-white transition-colors">Job Offer Module</Link></li>
              <li><Link to="/applications" className="hover:text-white transition-colors">Applications Module</Link></li>
              <li><Link to="/history" className="hover:text-white transition-colors">Document History</Link></li>
            </ul>
          </div>

          {/* Research */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Research</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Gaucher et al. 2011 <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Criado-Perez 2019 <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  Trix & Psenka 2003 <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <p>© 2026 Nubias. Academic simulation project. Not for commercial use.</p>
          <div className="flex items-center gap-4">
            <span>AI model: Hugging Face SLM ≤1B params</span>
            <span>·</span>
            <span>EU AI Act compliant by design</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
