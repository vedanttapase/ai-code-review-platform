'use client'

import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full rounded-none" />,
})

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '100%',
}: {
  value: string
  onChange?: (value: string) => void
  language: string
  readOnly?: boolean
  height?: string
}) {
  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      onChange={(v) => onChange?.(v ?? '')}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 12 },
        wordWrap: 'on',
        tabSize: 2,
      }}
    />
  )
}
