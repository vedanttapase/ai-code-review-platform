'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { reviews, repoReviews } from '@/lib/db/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getReviews() {
  const userId = await getUserId()
  return db
    .select({
      id: reviews.id,
      title: reviews.title,
      language: reviews.language,
      mode: reviews.mode,
      sourceType: reviews.sourceType,
      score: reviews.score,
      issueCount: reviews.issueCount,
      criticalCount: reviews.criticalCount,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(100)
}

export async function getReview(id: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteReview(id: number) {
  const userId = await getUserId()
  await db.delete(reviews).where(and(eq(reviews.id, id), eq(reviews.userId, userId)))
  revalidatePath('/dashboard')
}

export async function getRepoReviews() {
  const userId = await getUserId()
  return db
    .select({
      id: repoReviews.id,
      repoUrl: repoReviews.repoUrl,
      repoName: repoReviews.repoName,
      healthScore: repoReviews.healthScore,
      createdAt: repoReviews.createdAt,
    })
    .from(repoReviews)
    .where(eq(repoReviews.userId, userId))
    .orderBy(desc(repoReviews.createdAt))
    .limit(50)
}

export async function getRepoReview(id: number) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(repoReviews)
    .where(and(eq(repoReviews.id, id), eq(repoReviews.userId, userId)))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteRepoReview(id: number) {
  const userId = await getUserId()
  await db.delete(repoReviews).where(and(eq(repoReviews.id, id), eq(repoReviews.userId, userId)))
  revalidatePath('/dashboard')
}

export async function getDashboardStats() {
  const userId = await getUserId()

  const [totals] = await db
    .select({
      totalReviews: sql<number>`count(*)::int`,
      avgScore: sql<number>`coalesce(round(avg(${reviews.score})), 0)::int`,
      totalIssues: sql<number>`coalesce(sum(${reviews.issueCount}), 0)::int`,
      totalCritical: sql<number>`coalesce(sum(${reviews.criticalCount}), 0)::int`,
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))

  const scoreTrend = await db
    .select({
      id: reviews.id,
      score: reviews.score,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt))
    .limit(20)

  const languageUsage = await db
    .select({
      language: reviews.language,
      count: sql<number>`count(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .groupBy(reviews.language)
    .orderBy(desc(sql`count(*)`))
    .limit(8)

  return {
    totals,
    scoreTrend: scoreTrend.reverse(),
    languageUsage,
  }
}
