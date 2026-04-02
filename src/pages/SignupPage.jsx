import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ArrowRight, Eye, EyeOff, Building2, Mail, Lock, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ company: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('form') // 'form' | 'success'

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Simulate a brief network delay for realism
    await new Promise(r => setTimeout(r, 900))
    setStep('success')
    await new Promise(r => setTimeout(r, 1200))
    signIn(form.email)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 hero-gradient flex-col justify-between p-12 text-white">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <span className="font-bold text-xl">Nubias</span>
        </Link>

        <div>
          <h2 className="text-3xl font-bold leading-tight mb-4">
            Build a hiring pipeline<br />free from gender bias
          </h2>
          <ul className="space-y-3 text-white/80 text-sm">
            {[
              'Real-time bias detection in job postings',
              'Blind CV and cover letter anonymisation',
              'Research-backed · EU AI Act compliant',
              'Human-in-the-loop at every step',
            ].map(item => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white/10 border border-white/20 px-5 py-4">
          <p className="text-xs text-white/60 mb-1 font-semibold uppercase tracking-wider">Demo mode</p>
          <p className="text-sm text-white/80">
            This demo automatically connects you to the <strong className="text-white">KEDGE</strong> organisation account.
            All features work exactly as in production.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-700 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-xl text-brand-900">Nubias</span>
          </Link>

          {step === 'success' ? (
            <div className="text-center fade-in-up">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Account created!</h2>
              <p className="text-slate-500 text-sm">Connecting you to KEDGE…</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your company account</h1>
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign in</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Company name</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="KEDGE Business School"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Work email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="hr@yourcompany.com"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className="input-field pl-10 pr-10"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 text-xs text-brand-700">
                  <strong>Demo notice:</strong> Signing up automatically connects you to the{' '}
                  <strong>KEDGE</strong> organisation. No real data is stored.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    <>Create account <ArrowRight size={16} /></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
                By creating an account you agree to our Terms of Service and Privacy Policy.
                All AI outputs are suggestions requiring human review.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
