import {
  ArrowRight,
  Check,
  Play,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const features = [
  {
    title: 'Real-time upload & processing',
    desc: 'Socket.io progress from browser upload through cloud storage — see every stage on your dashboard.',
    icon: Zap,
  },
  {
    title: 'Multi-tenant & roles',
    desc: 'JWT auth with viewer, editor, and admin. Each account sees only their library; admins oversee all.',
    icon: Sparkles,
  },
  {
    title: 'Range-aware streaming',
    desc: 'The API can proxy your CDN with forwarded Range requests (206 partial content) for reliable seeking in the player.',
    icon: Shield,
  },
]

const steps = [
  { n: '01', title: 'Upload video', desc: 'Multipart upload to Node + Cloudinary with live Socket.io progress on Home.' },
  {
    n: '02',
    title: 'Scan & classify',
    desc: 'FFmpeg samples frames; Google Vision Safe Search marks videos safe or flagged with clear tags in MongoDB.',
  },
  { n: '03', title: 'Stream & manage', desc: 'Role-based library, comments, and `/api/videos/:id/stream` for the player.' },
]

const pricing = [
  {
    name: 'Free',
    price: '$0',
    blurb: 'For individuals exploring the product.',
    features: ['5 videos / month', 'Basic scan', 'Community support'],
    cta: 'Start free',
    href: '/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    blurb: 'For teams that need scale and SLAs.',
    features: ['Unlimited videos', 'Priority processing', 'SSO & roles', 'Webhook alerts'],
    cta: 'Go Pro',
    href: '/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    blurb: 'For regulated industries and global rollouts.',
    features: ['Dedicated infra', 'VPC / on-prem', 'Custom models', '24/7 support'],
    cta: 'Contact sales',
    href: '/signup',
    highlight: false,
  },
]

export function LandingPage() {
  return (
    <div className="min-h-svh bg-[var(--color-surface)]">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/75 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white shadow-lg shadow-blue-500/30">
              VS
            </span>
            <span className="hidden sm:inline">Video Sensitivity Analyzer</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Log in
            </Link>
            <Link to="/signup">
              <Button className="px-4 py-2 text-sm">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent),radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(139,92,246,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:px-6 sm:pt-24">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Real-time sensitivity analysis
          </p>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl lg:leading-[1.08]">
            Upload Videos. Detect Sensitive Content.{' '}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              Stream Securely.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl">
            Run continuous, real-time sensitivity analysis on every frame. Route safe content to viewers
            faster — and keep flagged segments in review until your team approves.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link to="/signup">
              <Button className="min-w-[160px] px-6 py-3 text-base">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link
              to="/login"
              className="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-6 py-3 text-base font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md active:scale-[0.98]"
            >
              <Play className="h-4 w-4" />
              View Demo
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Built for modern video workflows
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Everything you need to ingest, analyze, and deliver video with confidence.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map(({ title, desc, icon: Icon }) => (
            <Card key={title} hover className="group">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/10 to-violet-600/10 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white/50 py-16 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
            From upload to secure playback in three clear steps.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="text-4xl font-bold text-slate-200">{s.n}</span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Simple pricing
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-600">
          Start free, upgrade when you need enterprise controls.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {pricing.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-0.5 ${tier.highlight ? 'border-blue-300/80 bg-gradient-to-b from-white to-blue-50/40 ring-2 ring-blue-500/20' : 'border-slate-200/60 bg-white hover:shadow-[var(--shadow-card-hover)]'}`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-3 py-0.5 text-xs font-semibold text-white shadow-md">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-slate-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{tier.blurb}</p>
              <p className="mt-6 text-4xl font-bold tracking-tight text-slate-900">
                {tier.price}
                {tier.price !== 'Custom' && <span className="text-lg font-medium text-slate-500">/mo</span>}
              </p>
              <ul className="mt-8 flex flex-1 flex-col gap-3 text-sm text-slate-600">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to={tier.href} className="mt-8 block">
                <Button
                  variant={tier.highlight ? 'primary' : 'secondary'}
                  className="w-full justify-center py-3"
                >
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-xs font-bold text-white">
              VS
            </span>
            Video Sensitivity Analyzer
          </div>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-600">
            <a href="#features" className="transition-colors hover:text-blue-600">
              Product
            </a>
            <a href="#pricing" className="transition-colors hover:text-blue-600">
              Pricing
            </a>
            <Link to="/login" className="transition-colors hover:text-blue-600">
              Log in
            </Link>
            <a href="#" className="transition-colors hover:text-blue-600">
              Security
            </a>
            <a href="#" className="transition-colors hover:text-blue-600">
              Privacy
            </a>
          </nav>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} Video Sensitivity Analyzer</p>
        </div>
      </footer>
    </div>
  )
}
