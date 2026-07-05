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

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/review')

  return (
    <main className="min-h-svh bg-background">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
          CodeSentry
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/sign-up" />}>Get started</Button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center md:pt-24">
        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
          <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
          Supports 28+ programming languages
        </div>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Ship better code with AI-powered reviews
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Detect bugs and security vulnerabilities, get line-by-line explanations, and auto-fix
          issues in any language. Analyze entire GitHub repositories and track your code quality
          over time.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/sign-up" />}>
            Start reviewing free
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/sign-in" />}>
            Sign in
          </Button>
        </div>
      </section>

      <section aria-label="Features" className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <Bug className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">Detect Mode</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Finds bugs, security vulnerabilities, performance bottlenecks, and code smells with
              severity ratings and line-level precision.
            </p>
          </Card>
          <Card className="p-6">
            <BookOpen className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">Explain Mode</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Section-by-section walkthroughs in plain English, so anyone can understand unfamiliar
              code in seconds.
            </p>
          </Card>
          <Card className="p-6">
            <Wrench className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">Fix Mode</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Automatically rewrites your code with all issues fixed and shows a full corrected
              version of every change.
            </p>
          </Card>
          <Card className="p-6">
            <FolderGit2 className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">GitHub Repo Analysis</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Point at any public repository and get a full health report: per-file scores, top
              issues, and language breakdown.
            </p>
          </Card>
          <Card className="p-6">
            <Gauge className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">Complexity Analysis</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Time and space complexity, cyclomatic complexity, and maintainability ratings for
              every review.
            </p>
          </Card>
          <Card className="p-6">
            <History className="mb-3 h-6 w-6 text-primary" aria-hidden="true" />
            <h2 className="mb-2 font-semibold text-foreground">Review History</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every review is saved to your dashboard with quality trends, language stats, and
              exportable reports.
            </p>
          </Card>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        CodeSentry — AI Code Review Platform
      </footer>
    </main>
    import ReviewHero3D from "@/components/review/review-hero-3d"
import DashboardCharts from "@/components/dashboard/dashboard-charts" //[cite: 1]

export default function Page() {
  return (
    <main className="min-h-screen bg-[#060709] p-6 space-y-8">
      {/* High-End 3D Visual Entry */}
      <ReviewHero3D />

      {/* Rest of Dashboard Contents beneath */}
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-xl font-bold text-zinc-400 mb-6">System Health Analytics</h2>
        <DashboardCharts /> {/*[cite: 1] */}
      </div>
    </main>
  )
}
  )
}
