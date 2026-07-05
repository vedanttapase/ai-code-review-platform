export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info'

export interface ReviewIssue {
  line: number
  endLine?: number
  severity: Severity
  category: string
  title: string
  description: string
  suggestion: string
}

export interface ExplainSection {
  startLine: number
  endLine: number
  title: string
  explanation: string
}

export interface ReviewResult {
  isCode: boolean
  rejectionReason?: string
  summary: string
  score: number
  complexity: {
    time: string
    space: string
    cyclomatic: number
    maintainability: 'excellent' | 'good' | 'fair' | 'poor'
  }
  issues: ReviewIssue[]
  explanations: ExplainSection[]
  fixedCode?: string
  fixSummary?: string
  strengths: string[]
}

export interface RepoFileReview {
  path: string
  language: string
  score: number
  issueCount: number
  summary: string
  topIssues: { severity: Severity; title: string; line: number }[]
}

export interface RepoReviewResult {
  repoName: string
  description: string
  healthScore: number
  totalFiles: number
  analyzedFiles: number
  languageBreakdown: { language: string; percentage: number }[]
  overallSummary: string
  strengths: string[]
  concerns: string[]
  files: RepoFileReview[]
}

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'info']
