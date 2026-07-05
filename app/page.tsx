import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ShieldCheck,
  Bug,
  BookOpen,
  Wrench,
  FolderGit2,
  Gauge,
  History,
  ArrowRight,
  Code2,
} from 'lucide-react'

// Native static import for the hardware-accelerated 3D element
import ReviewHero3D from '@/components/review/review-hero-3d'

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/review')

  return (
    <main className="min-h-svh bg-[#060709] text-white selection:bg-purple-500/30 selection:text-white overflow-x-hidden">
      {/* 1. Global Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#060709]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <ShieldCheck className="h-5 w-5 text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" aria-hidden="true" />
            CodeSentry
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="text-zinc-400 hover:text-white" nativeButton={false} render={<Link href="/sign-in" />}>
              Sign in
            </Button>
            <Button className="bg-white text-black hover:bg-zinc-200 shadow-lg" nativeButton={false} render={<Link href="/sign-up" />}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Interactive 3D Hero Spatial Canvas */}
      <section className="pt-16">
        <ReviewHero3D />
      </section>

      {/* 3. Core Capabilities Section (Premium Asymmetrical Grid) */}
      <section aria-label="Features" className="relative z-10 mx-auto max-w-6xl px-4 py-24">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-400">Platform Blueprint</h2>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">Engineered for absolute code security.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Card 1: Detect Mode */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Bug className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">Detect Mode</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Finds bugs, security vulnerabilities, performance bottlenecks, and code smells with
              severity ratings and line-level precision.
            </p>
          </Card>

          {/* Card 2: Explain Mode */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <BookOpen className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">Explain Mode</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Section-by-section walkthroughs in plain English, so anyone can understand unfamiliar
              code in seconds.
            </p>
          </Card>

          {/* Card 3: Fix Mode */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Wrench className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">Fix Mode</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Automatically rewrites your code with all issues fixed and shows a full corrected
              version of every change.
            </p>
          </Card>

          {/* Card 4: GitHub Repo Analysis */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <FolderGit2 className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">GitHub Repo Analysis</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Point at any public repository and get a full health report: per-file scores, top
              issues, and language breakdown.
            </p>
          </Card>

          {/* Card 5: Complexity Analysis */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Gauge className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">Complexity Analysis</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Time and space complexity, cyclomatic complexity, and maintainability ratings for
              every review.
            </p>
          </Card>

          {/* Card 6: Review History */}
          <Card className="group relative overflow-hidden bg-zinc-900/30 backdrop-blur-sm border-white/[0.05] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/30 hover:bg-zinc-900/50 hover:shadow-[0_8px_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <History className="mb-4 h-6 w-6 text-purple-400 transition-transform group-hover:scale-110" aria-hidden="true" />
            <h3 className="mb-2 font-semibold text-white">Review History</h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              Every review is saved to your dashboard with quality trends, language stats, and
              exportable reports.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. Footer System Wrapper */}
      <footer className="border-t border-white/[0.04] bg-[#090a0c] py-8 text-center text-xs tracking-wide text-zinc-500">
        &copy; {new Date().getFullYear()} CodeSentry &mdash; Next-Gen Intelligent Code Review Ecosystem.
      </footer>
    </main>
  )
}
