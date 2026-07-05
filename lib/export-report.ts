import type { ReviewResult } from '@/lib/review-types'

export function buildMarkdownReport(opts: {
  title: string
  language: string
  mode: string
  result: ReviewResult
  createdAt?: string
}): string {
  const { title, language, mode, result, createdAt } = opts
  const lines: string[] = []

  lines.push(`# CodeSentry Review Report`)
  lines.push('')
  lines.push(`**Title:** ${title}`)
  lines.push(`**Language:** ${language}`)
  lines.push(`**Mode:** ${mode}`)
  if (createdAt) lines.push(`**Date:** ${createdAt}`)
  lines.push(`**Quality Score:** ${result.score}/100`)
  lines.push('')
  lines.push(`## Summary`)
  lines.push(result.summary)
  lines.push('')

  lines.push(`## Complexity`)
  lines.push(`- Time: ${result.complexity.time}`)
  lines.push(`- Space: ${result.complexity.space}`)
  lines.push(`- Cyclomatic: ${result.complexity.cyclomatic}`)
  lines.push(`- Maintainability: ${result.complexity.maintainability}`)
  lines.push('')

  if (result.strengths.length) {
    lines.push(`## Strengths`)
    for (const s of result.strengths) lines.push(`- ${s}`)
    lines.push('')
  }

  if (result.issues.length) {
    lines.push(`## Issues (${result.issues.length})`)
    lines.push('')
    for (const issue of result.issues) {
      lines.push(`### [${issue.severity.toUpperCase()}] ${issue.title} (line ${issue.line})`)
      lines.push(`**Category:** ${issue.category}`)
      lines.push('')
      lines.push(issue.description)
      lines.push('')
      lines.push(`**Suggestion:** ${issue.suggestion}`)
      lines.push('')
    }
  }

  if (result.explanations.length) {
    lines.push(`## Code Walkthrough`)
    lines.push('')
    for (const ex of result.explanations) {
      lines.push(`### ${ex.title} (lines ${ex.startLine}-${ex.endLine})`)
      lines.push(ex.explanation)
      lines.push('')
    }
  }

  if (result.fixedCode) {
    lines.push(`## Fixed Code`)
    if (result.fixSummary) {
      lines.push('')
      lines.push(result.fixSummary)
    }
    lines.push('')
    lines.push('```')
    lines.push(result.fixedCode)
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n')
}

export function downloadText(filename: string, content: string, mime = 'text/markdown') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
