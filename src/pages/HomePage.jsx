import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, FileText, Users, Shield, Sparkles,
  AlertTriangle, BookOpen, BarChart3, CheckCircle2, ExternalLink
} from 'lucide-react'
import Footer from '../components/Footer'

const MASCULINE_WORDS = ['competitive', 'dominant', 'aggressive', 'ninja', 'rockstar', 'driven', 'ambitious']
const COMMUNAL_WORDS = ['helped', 'supported', 'assisted', 'collaborated', 'warm', 'nurturing']

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="hero-gradient pt-32 pb-20 px-4 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-10 w-64 h-64 rounded-full bg-brand-400/10 blur-2xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-6 text-white/90">
            <Sparkles size={13} />
            Research-backed · EU AI Act compliant · Academic project 2026
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6">
            Remove gender bias<br />
            <span className="text-brand-300">from your hiring pipeline</span>
          </h1>

          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Nubias detects masculine-coded language in job offers and anonymises candidate applications —
            making bias visible and correctable, at every stage of recruitment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-800 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Get started free <ArrowRight size={18} />
            </Link>
            <a
              href="#problem"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 text-lg"
            >
              Learn the research
            </a>
          </div>
        </div>

        {/* Floating word pills */}
        <div className="relative max-w-3xl mx-auto mt-16 hidden md:block">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
            <p className="text-xs text-white/60 uppercase tracking-widest mb-3 font-semibold">Live example — flagged words in a job posting</p>
            <p className="text-white/90 leading-loose text-sm">
              We are looking for a{' '}
              {MASCULINE_WORDS.slice(0, 3).map(w => (
                <span key={w} className="inline-block mx-1 px-2 py-0.5 bg-rose-400/30 border border-rose-300/50 rounded-md text-rose-200 font-medium text-xs">{w}</span>
              ))}
              {' '}self-starter to join our{' '}
              <span className="inline-block mx-1 px-2 py-0.5 bg-rose-400/30 border border-rose-300/50 rounded-md text-rose-200 font-medium text-xs">ninja</span>
              {' '}engineering team. You thrive in a{' '}
              <span className="inline-block mx-1 px-2 py-0.5 bg-rose-400/30 border border-rose-300/50 rounded-md text-rose-200 font-medium text-xs">high-pressure</span>
              {' '}environment.
            </p>
            <p className="text-xs text-white/50 mt-3">→ 5 masculine-coded words detected · Gender-neutral rewrite available</p>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 px-4 bg-slate-50 border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { stat: '44%', label: 'fewer women apply to jobs using masculine-coded language', source: 'Gaucher et al., 2011' },
            { stat: '2×', label: 'shorter recommendation letters written for women vs men', source: 'Trix & Psenka, 2003' },
            { stat: '70%', label: 'of hiring decisions influenced by language before skills review', source: 'Criado-Perez, 2019' },
          ].map(({ stat, label, source }) => (
            <div key={stat} className="card p-6">
              <div className="text-4xl font-extrabold text-brand-700 mb-2">{stat}</div>
              <p className="text-sm text-slate-600 mb-1">{label}</p>
              <p className="text-xs text-slate-400 font-medium">{source}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Problem ── */}
      <section id="problem" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-label mb-3">The Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Bias is in the language, <br className="hidden sm:block" />not just the mindset
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Gender bias in hiring is structural — embedded in the words used at every stage of recruitment.
              It operates largely below conscious awareness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                color: 'rose',
                title: 'Job Offers',
                desc: 'Words like competitive, dominant, and aggressive are statistically masculine-coded. They deter female applicants without affecting male applicant rates.',
                ref: 'Gaucher, Friesen & Kay, 2011',
              },
              {
                icon: Users,
                color: 'violet',
                title: 'CVs & Cover Letters',
                desc: 'Women use more communal language (helped, supported) which is evaluated less favourably than the agentic language more common in men\'s documents (led, delivered, drove).',
                ref: 'Research consensus',
              },
              {
                icon: BookOpen,
                color: 'amber',
                title: 'Recommendation Letters',
                desc: 'Letters for women are shorter, contain more doubt raisers, focus on traits rather than achievements, and use fewer superlatives — leading to worse outcomes for equally qualified candidates.',
                ref: 'Trix & Psenka, 2003',
              },
            ].map(({ icon: Icon, color, title, desc, ref }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl mb-4 flex items-center justify-center ${
                  color === 'rose'   ? 'bg-rose-100' :
                  color === 'violet' ? 'bg-violet-100' : 'bg-amber-100'
                }`}>
                  <Icon size={20} className={
                    color === 'rose'   ? 'text-rose-600' :
                    color === 'violet' ? 'text-violet-600' : 'text-amber-600'
                  } />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{desc}</p>
                <p className="text-xs text-slate-400 font-medium">Source: {ref}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution ── */}
      <section id="solution" className="py-20 px-4 bg-brand-950">
        <div className="max-w-5xl mx-auto text-white">
          <div className="text-center mb-12">
            <p className="section-label text-brand-300 mb-3">The Solution</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Two modules. One pipeline.
            </h2>
            <p className="text-lg text-brand-200 max-w-xl mx-auto">
              Nubias covers the two most impactful intervention points in a hiring pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center mb-5">
                <FileText size={20} className="text-rose-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Job Offer Module</h3>
              <p className="text-brand-200 text-sm leading-relaxed mb-4">
                Paste or write your job posting. The AI instantly detects masculine-coded and gendered vocabulary,
                explains why each word is flagged (with research backing), and suggests neutral alternatives.
                A live neutrality score guides you as you edit.
              </p>
              <ul className="space-y-1 text-sm text-brand-300">
                {['Real-time bias detection', 'Flagged word explanations', 'Gender-neutral rewrites', 'Neutrality score indicator'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center mb-5">
                <Users size={20} className="text-violet-300" />
              </div>
              <h3 className="text-xl font-bold mb-2">Applications Module</h3>
              <p className="text-brand-200 text-sm leading-relaxed mb-4">
                Paste or upload candidate CVs and cover letters. The AI produces two levels of anonymisation —
                surface (names, pronouns, titles removed) and full (gendered style words neutralised) —
                enabling truly blind shortlisting.
              </p>
              <ul className="space-y-1 text-sm text-brand-300">
                {['Name & pronoun removal', 'Full style-word neutralisation', 'Sequential file renaming', 'Identity mapping export'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Disclosure ── */}
      <section id="ai-disclosure" className="py-20 px-4 bg-amber-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="section-label text-amber-700 mb-3">AI Transparency</p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              How we use AI — and what it can't do
            </h2>
          </div>

          <div className="card p-8 border-amber-200">
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">This platform uses artificial intelligence</p>
                  <p>Nubias is powered by a Small Language Model (SLM) with ≤5 billion parameters, sourced from Hugging Face. This constraint was chosen deliberately for environmental responsibility and transparency.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield size={18} className="text-brand-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">AI outputs are suggestions, not decisions</p>
                  <p>Every analysis, flagged word, and rewrite generated by the platform is a <strong>draft for human review</strong>. No AI output is presented as final or authoritative. Human review is mandatory before any output is used in a hiring context.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BarChart3 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">EU AI Act compliance by design</p>
                  <p>AI systems used in employment are classified as high-risk under the EU AI Act (Annex III). Nubias implements human-in-the-loop review at every step, consistent with these obligations.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <a
                href="https://huggingface.co/ano666"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium"
              >
                <ExternalLink size={14} />
                View model card on Hugging Face
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4 bg-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Ready to build a more inclusive pipeline?
          </h2>
          <p className="text-lg text-slate-500 mb-8">
            Create your company account and start neutralising documents in minutes.
          </p>
          <Link
            to="/signup"
            className="btn-primary text-base px-8 py-4"
          >
            Create company account <ArrowRight size={18} />
          </Link>
          <p className="text-xs text-slate-400 mt-4">
            Demo version · Automatically connected as KEDGE organisation
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
