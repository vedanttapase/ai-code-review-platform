import { generateText, Output } from 'ai'
import { z } from 'zod'
import { getReviewModel } from '@/lib/ai'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'

export const maxDuration = 120

const reviewSchema = z.object({
  isCode: z
    .boolean()
    .describe(
      'true only if the input is actual source code in a programming language. false for prose, questions, or non-code content.',
    ),
  rejectionReason: z
    .string()
    .optional()
    .describe('If isCode is false, a short polite explanation that only programming code is accepted.'),
  summary: z.string().describe('2-3 sentence overview of what the code does and its overall quality.'),
  score: z.number().min(0).max(100).describe('Overall code quality score 0-100.'),
  complexity: z.object({
    time: z.string().describe('Big-O time complexity of the dominant logic, e.g. O(n log n). Use O(1) if trivial.'),
    space: z.string().describe('Big-O space complexity.'),
    cyclomatic: z.number().describe('Estimated cyclomatic complexity of the most complex function.'),
    maintainability: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  issues: z
    .array(
      z.object({
        line: z.number().describe('1-based line number where the issue starts.'),
        endLine: z.number().optional(),
        severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
        category: z
          .string()
          .describe('One of: Bug, Security, Performance, Style, Maintainability, Best Practice'),
        title: z.string().describe('Short issue title, under 10 words.'),
        description: z.string().describe('Clear explanation of the problem and why it matters.'),
        suggestion: z.string().describe('Concrete suggestion, include a corrected code snippet when helpful.'),
      }),
    )
    .describe('All detected issues. Empty array if the code is clean.'),
  explanations: z
    .array(
      z.object({
        startLine: z.number(),
        endLine: z.number(),
        title: z.string().describe('Short label for this block of code.'),
        explanation: z.string().describe('Plain-English explanation of what this block does.'),
      }),
    )
    .describe('Section-by-section walkthrough of the code. Only required for explain mode; empty otherwise.'),
  fixedCode: z
    .string()
    .optional()
    .describe('Only for fix mode: the complete corrected version of the code with all issues fixed.'),
  fixSummary: z.string().optional().describe('Only for fix mode: bullet-style summary of what was changed.'),
  strengths: z.array(z.string()).describe('2-4 things the code does well.'),
})

const MODE_INSTRUCTIONS: Record<string, string> = {
  detect: `Focus on DETECTING issues: bugs, security vulnerabilities (injection, XSS, secrets, unsafe deserialization, race conditions), performance problems, and code smells. Populate the issues array thoroughly. Leave explanations empty and do not produce fixedCode.`,
  explain: `Focus on EXPLAINING the code: produce a thorough section-by-section walkthrough in the explanations array so a junior developer can understand every part. Still list any critical/high issues you notice, but keep the issue list focused. Do not produce fixedCode.`,
  fix: `Focus on FIXING the code: detect all issues, then produce fixedCode containing the COMPLETE corrected source (not a fragment) and fixSummary describing each change. Preserve the original behavior and style where possible.`,
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { code, language, mode, title, sourceType } = body as {
    code: string
    language: string
    mode: 'detect' | 'explain' | 'fix'
    title?: string
    sourceType?: string
  }

  if (!code?.trim() || !language || !mode || !MODE_INSTRUCTIONS[mode]) {
    return Response.json({ error: 'Missing code, language, or mode' }, { status: 400 })
  }
  if (code.length > 100_000) {
    return Response.json({ error: 'Code too large (max 100KB)' }, { status: 400 })
  }

  try {
    const { output } = await generateText({
      model: getReviewModel(),
      output: Output.object({ schema: reviewSchema }),
      system: `You are CodeSentry, an expert senior code reviewer combining the perspectives of a security auditor, a performance engineer, and a readability-focused maintainer.

STRICT SCOPE GUARD: You ONLY review programming source code. If the input is not code (e.g. an essay, a question, random text, cooking recipes), set isCode=false, set rejectionReason to a brief polite message that this tool only reviews programming code, set score=0, and leave all arrays empty.

The user claims the code is written in: ${language}. If it is clearly a different programming language, still review it correctly and mention the mismatch in the summary.

${MODE_INSTRUCTIONS[mode]}

Line numbers are 1-based and must reference the exact input lines. Be precise, technical, and constructive. Never invent issues.`,
      prompt: code,
    })

    const result = output

    // Persist to history
    const criticalCount = result.issues.filter(
      (i) => i.severity === 'critical' || i.severity === 'high',
    ).length

    const inserted = await db
      .insert(reviews)
      .values({
        userId: session.user.id,
        title: title?.trim() || `${language} review`,
        language,
        mode,
        sourceType: sourceType || 'paste',
        code,
        result,
        score: result.isCode ? Math.round(result.score) : 0,
        issueCount: result.issues.length,
        criticalCount,
      })
      .returning({ id: reviews.id })

    return Response.json({ result, reviewId: inserted[0]?.id })
  } catch (err) {
    console.error('[v0] Review generation failed:', err)
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
    return Response.json({ error: 'Review failed. Please try again.' }, { status: 500 })
  }
}
