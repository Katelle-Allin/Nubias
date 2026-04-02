import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'
import { FileText, Users, Clock, ArrowRight, Sparkles, TrendingUp, AlertTriangle } from 'lucide-react'
import AIDisclaimer from '../components/AIDisclaimer'

const QUICK_ACTIONS = [
  {
    to: '/job-offer',
    icon: FileText,
    color: 'rose',
    title: 'Analyse a Job Offer',
    desc: 'Detect masculine-coded language and get a gender-neutral rewrite.',
    label: 'Open editor',
  },
  {
    to: '/applications',
    icon: Users,
    color: 'violet',
    title: 'Anonymise Applications',
    desc: 'Remove names, pronouns, and gendered language from CVs and cover letters.',
    label: 'Upload documents',
  },
  {
    to: '/history',
    icon: Clock,
    color: 'slate',
    title: 'Document History',
    desc: 'Access previously processed job offers and application batches.',
    label: 'View history',
  },
]

const colorMap = {
  rose:   { bg: 'bg-rose-50',   icon: 'bg-rose-100 text-rose-600',   border: 'border-rose-100'   },
  violet: { bg: 'bg-violet-50', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-100' },
  slate:  { bg: 'bg-slate-50',  icon: 'bg-slate-100 text-slate-600',  border: 'border-slate-100'  },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { history } = useHistory()

  const jobOfferCount = history.filter(h => h.type === 'job-offer').length
  const appCount = history.filter(h => h.type === 'application').length

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold text-lg">
              {user?.avatar}
            </div>
            <div>
              <p className="text-slate-500 text-sm">{greeting}</p>
              <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="badge bg-brand-100 text-brand-700">{user?.plan} Plan</span>
            <span className="badge bg-slate-100 text-slate-600">Demo Mode</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Job offers processed', value: jobOfferCount, icon: FileText, color: 'text-rose-600 bg-rose-50' },
            { label: 'Applications anonymised', value: appCount, icon: Users, color: 'text-violet-600 bg-violet-50' },
            { label: 'Total documents', value: history.length, icon: TrendingUp, color: 'text-brand-600 bg-brand-50' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 text-center">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* AI Disclaimer */}
        <div className="mb-8">
          <AIDisclaimer />
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map(({ to, icon: Icon, color, title, desc, label }) => {
              const c = colorMap[color]
              return (
                <Link
                  key={to}
                  to={to}
                  className={`card p-6 border ${c.border} ${c.bg} hover:shadow-md transition-all duration-200 group`}
                >
                  <div className={`w-10 h-10 rounded-xl ${c.icon} flex items-center justify-center mb-4`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{desc}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
                    {label} <ArrowRight size={14} />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent activity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent activity</h2>
            <Link to="/history" className="text-sm text-brand-600 hover:underline font-medium">
              View all
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="card p-10 text-center">
              <Sparkles size={32} className="text-brand-200 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No documents processed yet.</p>
              <p className="text-slate-400 text-xs mt-1">Start with a job offer or application batch above.</p>
            </div>
          ) : (
            <div className="card divide-y divide-slate-50">
              {history.slice(0, 5).map(entry => (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    entry.type === 'job-offer' ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'
                  }`}>
                    {entry.type === 'job-offer' ? <FileText size={14} /> : <Users size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{entry.title}</p>
                    <p className="text-xs text-slate-400">
                      {entry.type === 'job-offer' ? 'Job Offer' : 'Application'} ·{' '}
                      {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="badge bg-emerald-100 text-emerald-700">Done</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
