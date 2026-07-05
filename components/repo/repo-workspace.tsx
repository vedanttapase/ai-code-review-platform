'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Search } from 'lucide-react'
import { GithubIcon } from '@/components/icons/github-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RepoReviewResult } from '@/lib/review-types'
import { RepoResults } from '@/components/repo/repo-results'

export function RepoWorkspace() {
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RepoReviewResult | null>(null)

  async function analyze() {
    if (!repoUrl.trim() || loading) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/review-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Analysis failed')
        return
      }
      setResult(data.result as RepoReviewResult)
      toast.success('Repository analysis complete')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Repository Review</h1>
        <p className="text-sm text-muted-foreground">
          Paste a public GitHub repository URL to get an AI-powered health assessment of its most substantial source
          files.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <GithubIcon className="size-4" />
            Analyze a repository
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault()
              analyze()
            }}
          >
            <Input
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              aria-label="GitHub repository URL"
              className="font-mono text-sm"
              disabled={loading}
            />
            <Button type="submit" disabled={loading || !repoUrl.trim()} className="shrink-0">
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Search className="size-4" aria-hidden="true" />
                  Analyze repository
                </>
              )}
            </Button>
          </form>
          {loading && (
            <p className="mt-3 text-xs text-muted-foreground">
              Fetching the file tree, downloading the most substantial source files, and running the AI audit. This
              can take up to a minute for larger repositories.
            </p>
          )}
        </CardContent>
      </Card>

      {result && <RepoResults result={result} />}
    </main>
  )
}
