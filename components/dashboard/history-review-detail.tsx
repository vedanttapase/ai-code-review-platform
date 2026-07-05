'use client'

import { ReviewResults } from '@/components/review/review-results'
import type { ReviewResult } from '@/lib/review-types'

export function HistoryReviewDetail({
  result,
  mode,
  code,
  language,
  title,
}: {
  result: ReviewResult
  mode: string
  code: string
  language: string
  title: string
}) {
  return (
    <ReviewResults
      result={result}
      loading={false}
      mode={mode}
      code={code}
      language={language}
      title={title}
      onApplyFix={() => {}}
    />
  )
}
