import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getReview } from '@/app/actions/reviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { HistoryReviewDetail } from '@/components/dashboard/history-review-detail'
import type { ReviewResult } from '@/lib/review-types'

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numericId = Number(id)
  if (Number.isNaN(numericId)) notFound()

  const review = await getReview(numericId)
  if (!review) notFound()

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2"
          nativeButton={false}
          render={<Link href="/dashboard" />}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to dashboard
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{review.title}</h1>
          <Badge variant="outline">{review.language}</Badge>
          <Badge variant="secondary" className="capitalize">
            {review.mode}
          </Badge>
          <span className="text-sm text-muted-foreground">{review.createdAt.toLocaleString()}</span>
        </div>
      </div>

      <HistoryReviewDetail
        result={review.result as ReviewResult}
        mode={review.mode}
        code={review.code}
        language={review.language}
        title={review.title}
      />
    </main>
  )
}
