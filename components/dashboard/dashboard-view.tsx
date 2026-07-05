'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Activity,
  AlertOctagon,
  Bug,
  FileCode2,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { GithubIcon } from '@/components/icons/github-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { deleteReview, deleteRepoReview } from '@/app/actions/reviews'
import { ScoreTrendChart, LanguageUsageChart } from '@/components/dashboard/dashboard-charts'

interface ReviewRow {
  id: number
  title: string
  language: string
  mode: string
  sourceType: string
  score: number
  issueCount: number
  criticalCount: number
  createdAt: string
}

interface RepoRow {
  id: number
  repoUrl: string
  repoName: string
  healthScore: number
  createdAt: string
}

interface Stats {
  totals: {
    totalReviews: number
    avgScore: number
    totalIssues: number
    totalCritical: number
  }
  scoreTrend: { id: number; score: number; createdAt: Date | string }[]
  languageUsage: { language: string; count: number }[]
}

function scoreVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 80) return 'default'
  if (score >= 50) return 'secondary'
  return 'destructive'
}

export function DashboardView({
  stats,
  reviewHistory,
  repoHistory,
}: {
  stats: Stats
  reviewHistory: ReviewRow[]
  repoHistory: RepoRow[]
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<number | null>(null)

  async function handleDelete(id: number) {
    setDeleting(id)
    try {
      await deleteReview(id)
      toast.success('Review deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeleting(null)
    }
  }

  async function handleDeleteRepo(id: number) {
    setDeleting(id)
    try {
      await deleteRepoReview(id)
      toast.success('Repository review deleted')
      router.refresh()
    } catch {
      toast.error('Failed to delete repository review')
    } finally {
      setDeleting(null)
    }
  }

  const statCards = [
    {
      label: 'Total reviews',
      value: stats.totals.totalReviews,
      icon: FileCode2,
    },
    {
      label: 'Average score',
      value: `${stats.totals.avgScore}/100`,
      icon: Activity,
    },
    {
      label: 'Issues found',
      value: stats.totals.totalIssues,
      icon: Bug,
    },
    {
      label: 'Critical issues',
      value: stats.totals.totalCritical,
      icon: AlertOctagon,
    },
  ]

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your code quality at a glance — review history, score trends, and language usage.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 py-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <s.icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-semibold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Score trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart data={stats.scoreTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageUsageChart data={stats.languageUsage} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="code">
        <TabsList>
          <TabsTrigger value="code">Code reviews ({reviewHistory.length})</TabsTrigger>
          <TabsTrigger value="repos">Repository reviews ({repoHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="mt-4">
          {reviewHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <FileCode2 className="size-8 text-muted-foreground" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">No reviews yet. Run your first code review.</p>
                <Button size="sm" nativeButton={false} render={<Link href="/review" />}>
                  Start a review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {reviewHistory.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <Link
                        href={`/history/${r.id}`}
                        className="truncate font-medium hover:text-primary hover:underline"
                      >
                        {r.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline">{r.language}</Badge>
                        <Badge variant="secondary" className="capitalize">
                          {r.mode}
                        </Badge>
                        <span>{new Date(r.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scoreVariant(r.score)}>{r.score}/100</Badge>
                      <span className="text-xs text-muted-foreground">
                        {r.issueCount} issue{r.issueCount === 1 ? '' : 's'}
                        {r.criticalCount > 0 && ` · ${r.criticalCount} critical`}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete review ${r.title}`}
                        disabled={deleting === r.id}
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="repos" className="mt-4">
          {repoHistory.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <GithubIcon className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No repository reviews yet.</p>
                <Button size="sm" nativeButton={false} render={<Link href="/repo" />}>
                  Analyze a repository
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {repoHistory.map((r) => (
                <Card key={r.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate font-mono text-sm font-medium">{r.repoName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={scoreVariant(r.healthScore)}>Health {r.healthScore}/100</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Open ${r.repoName} on GitHub`}
                        nativeButton={false}
                        render={<a href={r.repoUrl} target="_blank" rel="noopener noreferrer" />}
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete repository review ${r.repoName}`}
                        disabled={deleting === r.id}
                        onClick={() => handleDeleteRepo(r.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  )
}
