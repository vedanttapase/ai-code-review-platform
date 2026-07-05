import { z } from 'zod'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews } from '@/lib/db/schema'

export const maxDuration = 120

const reviewSchema = z.object({
  isCode: z.boolean(),
  rejectionReason: z.string().optional(),
  summary: z.string(),
  score: z.number().min(0).max(100),
  complexity: z.object({
    time: z.string(),
    space: z.string(),
    cyclomatic: z.number(),
    maintainability: z.enum(['excellent', 'good', 'fair', 'poor']),
  }),
  issues: z.array(
    z.object({
      line: z.number(),
      endLine: z.number().optional(),
      severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
      category: z.string(),
      title: z.string(),
      description: z.string(),
      suggestion: z.string(),
    }),
  ),
  explanations: z.array(
    z.object({
      startLine: z.number(),
      endLine: z.number(),
      title: z.string(),
      explanation: z.string(),
    }),
  ),
  fixedCode: z.string().optional(),
  fixSummary: z.string().optional(),
  strengths: z.array(z.string()),
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

  const systemPrompt = `You are CodeSentry, an expert senior code reviewer combining the perspectives of a security auditor, a performance engineer, and a readability-focused maintainer.

STRICT SCOPE GUARD: You ONLY review programming source code. If the input is not code (e.g. an essay, a question, random text, cooking recipes), set isCode=false, set rejectionReason to a brief polite message that this tool only reviews programming code, set score=0, and leave all arrays empty.

The user claims the code is written in: ${language}. If it is clearly a different programming language, still review it correctly and mention the mismatch in the summary.

${MODE_INSTRUCTIONS[mode]}

Line numbers are 1-based and must reference the exact input lines. Be precise, technical, and constructive. Never invent issues.

IMPORTANT: Respond ONLY with a valid JSON object matching this exact structure — no markdown, no backticks, no extra text:
{
  "isCode": boolean,
  "rejectionReason": string or omit,
  "summary": string,
  "score": number 0-100,
  "complexity": { "time": string, "space": string, "cyclomatic": number, "maintainability": "excellent"|"good"|"fair"|"poor" },
  "issues": [{ "line": number, "endLine": number or omit, "severity": "critical"|"high"|"medium"|"low"|"info", "category": string, "title": string, "description": string, "suggestion": string }],
  "explanations": [{ "startLine": number, "endLine": number, "title": string, "explanation": string }],
  "fixedCode": string or omit,
  "fixSummary": string or omit,
  "strengths": [string]
}`

  try {
    const openrouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-code-review-platform.vercel.app',
        'X-Title': 'CodeSentry',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code },
        ],
        max_tokens: 4000,
        temperature: 0.2,
      }),
    })

    if (!openrouterRes.ok) {
      const errText = await openrouterRes.text()
      console.error('[review] OpenRouter error:', errText)
      return Response.json({ error: 'AI service error. Please try again.' }, { status: 502 })
    }

    const openrouterData = await openrouterRes.json()
    const raw = openrouterData.choices[0].message.content.trim()
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(clean)
    const result = reviewSchema.parse(parsed)

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
    console.error('[review] Review generation failed:', err)
    return Response.json({ error: 'Review failed. Please try again.' }, { status: 500 })
  }
}
