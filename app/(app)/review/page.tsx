import type { Metadata } from 'next'
import { ReviewWorkspace } from '@/components/review/review-workspace'

export const metadata: Metadata = {
  title: 'Code Review — CodeSentry',
}

export default function ReviewPage() {
  return <ReviewWorkspace />
}
