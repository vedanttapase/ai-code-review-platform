import type { Metadata } from 'next'
import { RepoWorkspace } from '@/components/repo/repo-workspace'

export const metadata: Metadata = {
  title: 'Repository Review — CodeSentry',
}

export default function RepoPage() {
  return <RepoWorkspace />
}
