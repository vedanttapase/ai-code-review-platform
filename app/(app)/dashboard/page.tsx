import type { Metadata } from 'next'
import { getDashboardStats, getReviews, getRepoReviews } from '@/app/actions/reviews'
import { DashboardView } from '@/components/dashboard/dashboard-view'

export const metadata: Metadata = {
  title: 'Dashboard — CodeSentry',
}

export default async function DashboardPage() {
  const [stats, reviewHistory, repoHistory] = await Promise.all([
    getDashboardStats(),
    getReviews(),
    getRepoReviews(),
  ])

  return (
    <DashboardView
      stats={stats}
      reviewHistory={reviewHistory.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      repoHistory={repoHistory.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
    />
  )
}
