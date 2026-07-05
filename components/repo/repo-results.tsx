'use client'

import { FileCode2, ShieldAlert, ThumbsUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScoreRing } from '@/components/score-ring'
import { SeverityBadge } from '@/components/severity-badge'
import type { RepoReviewResult } from '@/lib/review-types'

export function RepoResults({ result }: { result: RepoReviewResult }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-6 py-6 md:flex-row md:items-center">
          <div className="flex items-center justify-center">
            <ScoreRing score={result.healthScore} label="Health" size={120} />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-lg font-semibold">{result.repoName}</h2>
              <Badge variant="secondary">
                {result.analyzedFiles} of {result.totalFiles} files analyzed
              </Badge>
            </div>
            {result.description && <p className="text-sm text-muted-foreground">{result.description}</p>}
            <p className="text-sm leading-relaxed">{result.overallSummary}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsUp className="size-4 text-primary" aria-hidden="true" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
              Concerns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {result.concerns.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Language breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {result.languageBreakdown.map((l) => (
            <div key={l.language} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm">{l.language}</span>
              <Progress value={l.percentage} className="h-2" aria-label={`${l.language} ${l.percentage}%`} />
              <span className="w-10 shrink-0 text-right text-xs text-muted-foreground">{l.percentage}%</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCode2 className="size-4" aria-hidden="true" />
            File-by-file analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {result.files.map((f) => (
            <div key={f.path} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{f.path}</span>
                  <Badge variant="outline">{f.language}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={f.score >= 70 ? 'secondary' : 'destructive'}>{f.score}/100</Badge>
                  <span className="text-xs text-muted-foreground">
                    {f.issueCount} issue{f.issueCount === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.summary}</p>
              {f.topIssues.length > 0 && (
                <ul className="mt-3 flex flex-col gap-1.5">
                  {f.topIssues.map((issue, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-muted-foreground">L{issue.line}</span>
                      <span>{issue.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
