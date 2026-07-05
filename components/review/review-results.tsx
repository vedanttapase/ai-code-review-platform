'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ScoreRing } from '@/components/score-ring'
import { SeverityBadge } from '@/components/severity-badge'
import { CodeEditor } from '@/components/review/code-editor'
import { buildMarkdownReport, downloadText } from '@/lib/export-report'
import { getLanguage } from '@/lib/languages'
import type { ReviewResult, Severity } from '@/lib/review-types'
import { SEVERITY_ORDER } from '@/lib/review-types'
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  GitBranch,
  Wrench,
  FileDown,
  Ban,
  Sparkles,
} from 'lucide-react'

export function ReviewResults({
  result,
  loading,
  mode,
  code,
  language,
  title,
  onApplyFix,
}: {
  result: ReviewResult | null
  loading: boolean
  mode: string
  code: string
  language: string
  title: string
  onApplyFix: (fixedCode: string) => void
}) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 animate-pulse text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Analyzing your code…</p>
            <p className="text-sm text-muted-foreground">
              Running bug detection, security audit, and complexity analysis.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    )
  }

  if (!result) return null

  if (!result.isCode) {
    return (
      <Card className="border-destructive/40 p-6">
        <div className="flex items-start gap-3">
          <Ban className="mt-0.5 h-5 w-5 text-destructive" aria-hidden="true" />
          <div>
            <p className="font-semibold text-foreground">Not a programming question</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {result.rejectionReason ||
                'CodeSentry only reviews programming source code. Please paste valid code in a supported language.'}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const sortedIssues = [...result.issues].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity as Severity) - SEVERITY_ORDER.indexOf(b.severity as Severity),
  )

  const severityCounts = SEVERITY_ORDER.map((sev) => ({
    sev,
    count: result.issues.filter((i) => i.severity === sev).length,
  })).filter((s) => s.count > 0)

  const exportMarkdown = () => {
    const md = buildMarkdownReport({
      title,
      language: getLanguage(language)?.label || language,
      mode,
      result,
      createdAt: new Date().toLocaleString(),
    })
    downloadText(`${title.replace(/[^a-z0-9-_]+/gi, '-')}-report.md`, md)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary card */}
      <Card className="p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreRing score={result.score} label="Quality score" />
          <div className="flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">Review Summary</h2>
              {severityCounts.map(({ sev, count }) => (
                <span key={sev} className="flex items-center gap-1">
                  <SeverityBadge severity={sev} />
                  <span className="text-sm text-muted-foreground">×{count}</span>
                </span>
              ))}
              {result.issues.length === 0 && (
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden="true" />
                  Clean
                </Badge>
              )}
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{result.summary}</p>
          </div>
          <Button variant="outline" onClick={exportMarkdown}>
            <FileDown className="h-4 w-4" aria-hidden="true" />
            Export report
          </Button>
        </div>

        {/* Complexity strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Time complexity
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{result.complexity.time}</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" aria-hidden="true" />
              Space complexity
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{result.complexity.space}</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
              Cyclomatic
            </div>
            <p className="mt-1 font-mono text-sm font-semibold text-foreground">{result.complexity.cyclomatic}</p>
          </div>
          <div className="rounded-md border border-border bg-secondary/40 p-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
              Maintainability
            </div>
            <p className="mt-1 text-sm font-semibold capitalize text-foreground">
              {result.complexity.maintainability}
            </p>
          </div>
        </div>
      </Card>

      {/* Detail tabs */}
      <Tabs defaultValue={mode === 'explain' ? 'explain' : mode === 'fix' && result.fixedCode ? 'fix' : 'issues'}>
        <TabsList>
          <TabsTrigger value="issues">Issues ({result.issues.length})</TabsTrigger>
          {result.explanations.length > 0 && (
            <TabsTrigger value="explain">Walkthrough ({result.explanations.length})</TabsTrigger>
          )}
          {result.fixedCode && <TabsTrigger value="fix">Fixed code</TabsTrigger>}
          <TabsTrigger value="strengths">Strengths</TabsTrigger>
        </TabsList>

        <TabsContent value="issues" className="mt-3 flex flex-col gap-3">
          {sortedIssues.length === 0 ? (
            <Card className="p-6 text-center">
              <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-primary" aria-hidden="true" />
              <p className="font-medium text-foreground">No issues found</p>
              <p className="text-sm text-muted-foreground">This code passed the review cleanly.</p>
            </Card>
          ) : (
            sortedIssues.map((issue, i) => (
              <Card key={i} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge severity={issue.severity as Severity} />
                  <Badge variant="secondary">{issue.category}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    Line {issue.line}
                    {issue.endLine && issue.endLine !== issue.line ? `–${issue.endLine}` : ''}
                  </span>
                </div>
                <h3 className="mt-2 font-semibold text-foreground">{issue.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{issue.description}</p>
                <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Suggestion</p>
                  <p className="mt-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                    {issue.suggestion}
                  </p>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {result.explanations.length > 0 && (
          <TabsContent value="explain" className="mt-3 flex flex-col gap-3">
            {result.explanations.map((ex, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">
                    Lines {ex.startLine}–{ex.endLine}
                  </span>
                  <h3 className="font-semibold text-foreground">{ex.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{ex.explanation}</p>
              </Card>
            ))}
          </TabsContent>
        )}

        {result.fixedCode && (
          <TabsContent value="fix" className="mt-3">
            <Card className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
                <div>
                  <h3 className="font-semibold text-foreground">Corrected code</h3>
                  {result.fixSummary && (
                    <p className="mt-1 max-w-2xl whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                      {result.fixSummary}
                    </p>
                  )}
                </div>
                <Button size="sm" onClick={() => onApplyFix(result.fixedCode!)}>
                  <Wrench className="h-4 w-4" aria-hidden="true" />
                  Apply to editor
                </Button>
              </div>
              <div className="h-[360px]">
                <CodeEditor
                  value={result.fixedCode}
                  language={getLanguage(language)?.monacoId || 'plaintext'}
                  readOnly
                />
              </div>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="strengths" className="mt-3">
          <Card className="p-4">
            {result.strengths.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notable strengths recorded.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {result.issues.some((i) => i.severity === 'critical') && (
        <Card className="border-destructive/40 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Critical issues detected — fix these before shipping.
          </div>
        </Card>
      )}
    </div>
  )
}
