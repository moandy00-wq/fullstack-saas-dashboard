'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  FolderKanban,
  CheckCircle2,
  Shield,
  Zap,
  ArrowRight,
  LayoutDashboard,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  BarChart3,
  Lock,
} from 'lucide-react'

function AnimatedCounter({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-white animate-counter" style={{ animationFillMode: 'both' }}>
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-zinc-500">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  index: number
}) {
  return (
    <div
      className="group relative rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900"
      style={{ animationDelay: `${index * 0.1 + 0.3}s`, animationFillMode: 'both' }}
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/10 transition-colors duration-300 group-hover:bg-emerald-500/20">
        <Icon className="h-5 w-5 text-emerald-400" />
      </div>
      <h3 className="mb-2 text-base font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  )
}

function WorkflowStep({
  step,
  title,
  description,
  index,
}: {
  step: string
  title: string
  description: string
  index: number
}) {
  return (
    <div
      className="relative flex items-start gap-4 animate-slide-in-right"
      style={{ animationDelay: `${index * 0.15 + 0.5}s`, animationFillMode: 'both' }}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm font-semibold text-emerald-400">
        {step}
      </div>
      <div>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl animate-fade-in-down">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10">
              <FolderKanban className="h-4 w-4 text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">
              <span className="text-emerald-400">Pro</span>ject Manager
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-white px-3 py-1.5 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Ambient background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px] animate-float-slow"
          />
          <div
            className="absolute top-40 right-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/3 blur-[100px] animate-float"
            style={{ animationDelay: '2s' }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Badge */}
          <div className="flex justify-center animate-fade-in-down" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-xs font-medium text-zinc-400">
              <div className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              Now in public beta
            </div>
          </div>

          {/* Headline */}
          <div className="mt-8 text-center">
            <h1 className="animate-slide-in-up-big text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl" style={{ animationFillMode: 'both' }}>
              Ship projects,
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                not spreadsheets.
              </span>
            </h1>
            <p
              className="mx-auto mt-6 max-w-xl text-lg text-zinc-400 animate-fade-in-up"
              style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
            >
              A focused project manager built for individuals who want clarity,
              not complexity. Create projects, track tasks, and get things done.
            </p>
          </div>

          {/* CTA Buttons — Unique layout: stacked horizontally with divider */}
          <div
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center animate-fade-in-up"
            style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20"
            >
              Start for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <div className="hidden h-8 w-px bg-zinc-800 sm:block" />
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
            >
              Sign in to dashboard
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Stats Row */}
          <div
            className="mt-16 grid grid-cols-3 gap-8 border-t border-zinc-800/50 pt-10 mx-auto max-w-lg animate-fade-in-up"
            style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
          >
            <AnimatedCounter value="100%" label="Free forever" />
            <AnimatedCounter value="<1s" label="Load time" />
            <AnimatedCounter value="RLS" label="Data isolation" />
          </div>
        </div>
      </section>

      {/* Dashboard Preview — Floating mockup */}
      <section className="relative px-6 pb-20">
        <div className="mx-auto max-w-5xl">
          <div
            className="animate-slide-in-up-big rounded-lg border border-zinc-800 bg-zinc-900/80 p-1 shadow-2xl shadow-black/40"
            style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
          >
            <div className="rounded-md bg-zinc-950 p-6">
              {/* Mock nav bar */}
              <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                </div>
                <div className="h-5 w-48 rounded bg-zinc-800" />
              </div>
              {/* Mock content */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {['Website Redesign', 'API Integration', 'Mobile App'].map((name, i) => (
                  <div
                    key={name}
                    className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4 animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.12 + 0.9}s`, animationFillMode: 'both' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-emerald-500/20" />
                      <span className="text-xs font-medium text-zinc-300">{name}</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      {[...Array(3)].map((_, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-sm border ${j === 0 ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700'}`} />
                          <div className={`h-2 rounded ${j === 2 ? 'w-16' : 'w-24'} bg-zinc-800`} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-zinc-600">
                      <CheckCircle2 className="h-3 w-3 text-emerald-500/50" />
                      <span>{i + 1}/3 done</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative px-6 py-24 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 animate-fade-in">Features</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="mt-4 text-zinc-400 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Built for clarity. No bloat, no learning curve, no 47-step onboarding.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              index={0}
              icon={FolderKanban}
              title="Organize by project"
              description="Group tasks under projects. Each project is a self-contained workspace with its own task list, progress, and context."
            />
            <FeatureCard
              index={1}
              icon={CheckCircle2}
              title="Track completion"
              description="Toggle tasks between in-progress and completed with one click. See what's done and what still needs attention."
            />
            <FeatureCard
              index={2}
              icon={Zap}
              title="Instant actions"
              description="Create, complete, and delete without page reloads. Server actions make every interaction feel instantaneous."
            />
            <FeatureCard
              index={3}
              icon={Shield}
              title="Row-level security"
              description="Your data is yours alone. Supabase RLS ensures no one can see, access, or modify another user's projects — ever."
            />
            <FeatureCard
              index={4}
              icon={BarChart3}
              title="Priority system"
              description="Tag tasks as High, Medium, or Low priority. Color-coded badges make it obvious where to focus your energy."
            />
            <FeatureCard
              index={5}
              icon={Clock}
              title="Due date tracking"
              description="Set deadlines on tasks. Overdue items are flagged automatically so nothing slips through the cracks."
            />
          </div>
        </div>
      </section>

      {/* How It Works — Asymmetric split layout */}
      <section className="relative px-6 py-24 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
            {/* Left — Steps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 animate-fade-in">How it works</p>
              <h2 className="mt-3 text-3xl font-bold text-white animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
                From zero to organized<br />in under a minute.
              </h2>
              <div className="mt-10 space-y-8">
                <WorkflowStep
                  index={0}
                  step="1"
                  title="Create your account"
                  description="Sign up with email and password. No credit card, no OAuth, no friction."
                />
                <WorkflowStep
                  index={1}
                  step="2"
                  title="Create a project"
                  description="Name it, describe it, and you're in. Each project is a clean workspace."
                />
                <WorkflowStep
                  index={2}
                  step="3"
                  title="Add and manage tasks"
                  description="Set titles, priorities, and due dates. Toggle completion with one click."
                />
                <WorkflowStep
                  index={3}
                  step="4"
                  title="Ship with clarity"
                  description="See what's done, what's next, and what's overdue — all in one view."
                />
              </div>
            </div>

            {/* Right — Visual element */}
            <div className="relative animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                {/* Mini task list mockup */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <span className="text-sm font-semibold text-white">Website Redesign</span>
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">3/5 done</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { title: 'Design homepage mockup', done: true, priority: 'High' },
                    { title: 'Build component library', done: true, priority: 'High' },
                    { title: 'Implement auth flow', done: true, priority: 'Medium' },
                    { title: 'Write API documentation', done: false, priority: 'Medium' },
                    { title: 'Deploy to production', done: false, priority: 'Low' },
                  ].map((task, i) => (
                    <div
                      key={task.title}
                      className="flex items-center gap-3 rounded-md border border-zinc-800/50 bg-zinc-900/30 px-3 py-2.5 animate-slide-in-right"
                      style={{ animationDelay: `${i * 0.08 + 0.6}s`, animationFillMode: 'both' }}
                    >
                      <div className={`h-4 w-4 rounded-sm border ${task.done ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700'} flex items-center justify-center`}>
                        {task.done && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                      </div>
                      <span className={`flex-1 text-sm ${task.done ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                        {task.title}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Floating accent */}
              <div className="absolute -bottom-3 -right-3 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Security Section — Clean, data-driven */}
      <section className="relative px-6 py-24 border-t border-zinc-800/50">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-10 lg:p-14">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs font-medium text-emerald-400">
                  <Lock className="h-3 w-3" />
                  Enterprise-grade security
                </div>
                <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                  Your data stays yours.
                </h2>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  Every query runs through Supabase Row Level Security. Your projects and tasks
                  are invisible to other users — not just hidden in the UI, but blocked at the
                  database level. No API trick, no URL guessing, no loopholes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Shield, label: 'Row-level security', detail: 'Database enforced' },
                  { icon: Lock, label: 'Session tokens', detail: 'HTTP-only cookies' },
                  { icon: Users, label: 'Data isolation', detail: 'Per-user scoping' },
                  { icon: Zap, label: 'Server actions', detail: 'No client secrets' },
                ].map((item, i) => (
                  <div
                    key={item.label}
                    className="rounded-md border border-zinc-800 bg-zinc-950/50 p-4 animate-scale-in"
                    style={{ animationDelay: `${i * 0.1 + 0.2}s`, animationFillMode: 'both' }}
                  >
                    <item.icon className="h-4 w-4 text-emerald-400" />
                    <p className="mt-2 text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative px-6 py-24 border-t border-zinc-800/50">
        <div className="mx-auto max-w-2xl text-center">
          <div className="animate-fade-in-up" style={{ animationFillMode: 'both' }}>
            <Sparkles className="mx-auto h-6 w-6 text-emerald-400 animate-rotate-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }} />
            <h2 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
              Ready to get organized?
            </h2>
            <p className="mt-4 text-zinc-400">
              Free forever. No credit card required. Start managing your projects in under 60 seconds.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-2 rounded-md bg-white px-8 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-zinc-200"
              >
                Create free account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Already have an account?
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10">
              <FolderKanban className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-zinc-500">Project Manager</span>
          </div>
          <p className="text-xs text-zinc-600">Built with Next.js, Supabase, and Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}
