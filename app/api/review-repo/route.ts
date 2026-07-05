import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getReviewModel } from '@/lib/ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { repoReviews } from '@/lib/db/schema'
import { detectLanguageFromFilename } from '@/lib/languages'

export const maxDuration = 300

const repoSchema = z.object({
  healthScore: z.number().min(0).max(100).describe('Overall repository health score 0-100.'),
  overallSummary: z.string().describe('3-4 sentence assessment of the codebase quality and architecture.'),
  strengths: z.array(z.string()).describe('3-5 things the repository does well.'),
  concerns: z.array(z.string()).describe('3-5 most important concerns or risks.'),
  files: z.array(
    z.object({
      path: z.string(),
      language: z.string(),
      score: z.number().min(0).max(100),
      issueCount: z.number(),
      summary: z.string().describe('1-2 sentence assessment of this file.'),
      topIssues: z.array(
        z.object({
          severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
          title: z.string(),
          line: z.number(),
        }),
      ),
    }),
  ),
})

function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s#?]+)/i)
  if (!match) return null
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') }
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { repoUrl } = (await req.json()) as { repoUrl: string }
  const parsed = parseRepoUrl(repoUrl || '')
  if (!parsed) {
    return Response.json({ error: 'Invalid GitHub URL. Use format: https://github.com/owner/repo' }, { status: 400 })
  }

  const { owner, repo } = parsed
  const ghHeaders: HeadersInit = { Accept: 'application/vnd.github+json', 'User-Agent': 'CodeSentry' }

  try {
    // Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: ghHeaders })
    if (repoRes.status === 404) {
      return Response.json({ error: 'Repository not found. Make sure it is public.' }, { status: 404 })
    }
    if (repoRes.status === 403) {
      return Response.json({ error: 'GitHub rate limit reached. Try again in a few minutes.' }, { status: 429 })
    }
    if (!repoRes.ok) {
      return Response.json({ error: 'Failed to fetch repository.' }, { status: 502 })
    }
    const repoMeta = await repoRes.json()
    const defaultBranch = repoMeta.default_branch || 'main'

    // Fetch file tree
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers: ghHeaders },
    )
    if (!treeRes.ok) {
      return Response.json({ error: 'Failed to fetch repository file tree.' }, { status: 502 })
    }
    const tree = await treeRes.json()

    const codeFiles = (tree.tree as { path: string; type: string; size?: number }[])
      .filter(
        (f) =>
          f.type === 'blob' &&
          detectLanguageFromFilename(f.path) &&
          !f.path.includes('node_modules/') &&
          !f.path.includes('vendor/') &&
          !f.path.includes('.min.') &&
          !f.path.includes('dist/') &&
          !f.path.includes('build/') &&
          (f.size ?? 0) > 100 &&
          (f.size ?? 0) < 40_000,
      )
      .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))

    if (codeFiles.length === 0) {
      return Response.json({ error: 'No reviewable source files found in this repository.' }, { status: 400 })
    }

    // Language breakdown across all code files
    const langCounts = new Map<string, number>()
    for (const f of codeFiles) {
      const lang = detectLanguageFromFilename(f.path)!.label
      langCounts.set(lang, (langCounts.get(lang) || 0) + 1)
    }
    const languageBreakdown = Array.from(langCounts.entries())
      .map(([language, count]) => ({
        language,
        percentage: Math.round((count / codeFiles.length) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 6)

    // Pick up to 8 most substantial files and fetch their contents
    const selected = codeFiles.slice(0, 8)
    const contents = await Promise.all(
      selected.map(async (f) => {
        const res = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${f.path}`,
          { headers: { 'User-Agent': 'CodeSentry' } },
        )
        if (!res.ok) return null
        const text = await res.text()
        return {
          path: f.path,
          language: detectLanguageFromFilename(f.path)!.label,
          content: text.slice(0, 12_000),
        }
      }),
    )
    const fileContents = contents.filter(Boolean) as { path: string; language: string; content: string }[]

    if (fileContents.length === 0) {
      return Response.json({ error: 'Could not download any source files from the repository.' }, { status: 502 })
    }

    const filesPrompt = fileContents
      .map((f) => `=== FILE: ${f.path} (${f.language}) ===\n${f.content}`)
      .join('\n\n')

    const { output } = await generateText({
      model: getReviewModel(),
      output: Output.object({ schema: repoSchema }),
      system: `You are CodeSentry, an expert repository auditor. Analyze the provided source files from the GitHub repository "${owner}/${repo}" and produce a structured health assessment. For each file, give a quality score, issue count, a brief summary, and up to 3 top issues with line numbers. Then give an overall health score, summary, strengths, and concerns for the whole repository. Be precise and technical; never invent issues.`,
      prompt: filesPrompt,
    })

    const result = {
      repoName: `${owner}/${repo}`,
      description: repoMeta.description || '',
      healthScore: Math.round(output.healthScore),
      totalFiles: codeFiles.length,
      analyzedFiles: fileContents.length,
      languageBreakdown,
      overallSummary: output.overallSummary,
      strengths: output.strengths,
      concerns: output.concerns,
      files: output.files,
    }

    const inserted = await db
      .insert(repoReviews)
      .values({
        userId: session.user.id,
        repoUrl,
        repoName: `${owner}/${repo}`,
        result,
        healthScore: result.healthScore,
      })
      .returning({ id: repoReviews.id })

    return Response.json({ result, reviewId: inserted[0]?.id })
  } catch (err) {
    console.error('[v0] Repo review failed:', err)
    const message = err instanceof Error ? err.message : ''
    if (message.includes('credit card') || message.includes('customer_verification_required')) {
      return Response.json(
        {
          error:
            'No AI provider configured. Add an OPENROUTER_API_KEY environment variable (free at openrouter.ai) or activate the Vercel AI Gateway.',
        },
        { status: 402 },
      )
    }
    if (message.includes('401') || message.toLowerCase().includes('unauthorized')) {
      return Response.json(
        { error: 'AI provider rejected the API key. Check that OPENROUTER_API_KEY is valid.' },
        { status: 402 },
      )
    }
    return Response.json({ error: 'Repository analysis failed. Please try again.' }, { status: 500 })
  }
}
