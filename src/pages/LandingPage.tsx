import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6d28d9, transparent)' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <span className="text-xl font-bold text-white">ChatFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2">
            Start Free Trial
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-4 pt-20 pb-16 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-300 font-medium">LLaMA 3.3 70B — fast &amp; accurate</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Deploy AI chatbots<br />
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #60a5fa)' }}>
            in minutes
          </span>
          {' '}— no code required
        </h1>

        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Embed a fully trained AI chatbot on your website with a single line of JavaScript.
          Handle support, answer FAQs, and capture leads around the clock.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/register" className="btn-primary px-8 py-3 text-base font-semibold w-full sm:w-auto">
            Start Free Trial
          </Link>
          <Link to="/login" className="px-8 py-3 text-base text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-all w-full sm:w-auto text-center">
            Sign In
          </Link>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              ),
              title: '1-line JS embed',
              desc: 'Paste one script tag. Chatbot appears instantly on any website or framework.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              ),
              title: 'LLaMA 3.3 70B',
              desc: 'Open-source frontier model handles nuanced questions with human-like accuracy.',
            },
            {
              icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              ),
              title: 'Custom branding',
              desc: 'Match your brand colors, logo, and tone. Full white-label on Pro plan.',
            },
          ].map((f) => (
            <div key={f.title} className="card-dark p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400">
                {f.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Simple, transparent pricing</h2>
          <p className="text-slate-400 text-sm">Start free. Upgrade when you need more conversations.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Free */}
          <div className="card-dark p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Free</p>
              <p className="text-3xl font-bold text-white">$0<span className="text-sm font-normal text-slate-500">/mo</span></p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-400 flex-1">
              {['100 messages/month', '1 chatbot', 'ChatFlow branding', 'Email support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center text-sm border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl px-4 py-2.5 transition-all">
              Get started free
            </Link>
          </div>

          {/* Starter — highlighted */}
          <div className="card-dark p-6 flex flex-col gap-5 relative ring-1 ring-violet-500/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full">Popular</span>
            </div>
            <div>
              <p className="text-xs font-medium text-violet-400 uppercase tracking-widest mb-1">Starter</p>
              <p className="text-3xl font-bold text-white">$39<span className="text-sm font-normal text-slate-500">/mo</span></p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-400 flex-1">
              {['500 messages/month', '1 chatbot', 'Remove ChatFlow branding', 'Priority support', 'Analytics dashboard'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="btn-primary block text-center text-sm px-4 py-2.5">
              Start Free Trial
            </Link>
          </div>

          {/* Pro */}
          <div className="card-dark p-6 flex flex-col gap-5">
            <div>
              <p className="text-xs font-medium text-blue-400 uppercase tracking-widest mb-1">Pro</p>
              <p className="text-3xl font-bold text-white">$79<span className="text-sm font-normal text-slate-500">/mo</span></p>
            </div>
            <ul className="space-y-2.5 text-sm text-slate-400 flex-1">
              {['Unlimited messages', '5 chatbots', 'Full white-label & custom branding', 'Dedicated support', 'API access', 'Custom integrations'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register" className="block text-center text-sm border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl px-4 py-2.5 transition-all">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-20">
        <p className="text-center text-xs font-medium text-slate-600 uppercase tracking-widest mb-8">What early users are saying</p>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              quote: "Set it up in under 5 minutes. Our restaurant's chatbot now handles reservation questions 24/7 so I don't have to.",
              author: 'Maria S.',
              role: 'Restaurant owner',
            },
            {
              quote: "We replaced a $200/month live-chat tool with ChatFlow at $39. Our leads actually get faster responses now.",
              author: 'James T.',
              role: 'Real estate agent',
            },
            {
              quote: 'I added it to three client sites last week. The one-line embed is a game changer for my agency workflow.',
              author: 'Priya N.',
              role: 'Freelance web designer',
            },
          ].map(({ quote, author, role }) => (
            <div key={author} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">"{quote}"</p>
              <div>
                <p className="text-xs font-semibold text-white">{author}</p>
                <p className="text-xs text-slate-600">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-400">ChatFlow</span>
        </div>
        <p className="text-xs text-slate-600">© 2026 ForgeAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
