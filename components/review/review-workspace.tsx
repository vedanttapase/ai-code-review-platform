'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CodeEditor } from '@/components/review/code-editor'
import { ReviewResults } from '@/components/review/review-results'
import { LANGUAGES, MODES, detectLanguageFromFilename, getLanguage, type ReviewMode } from '@/lib/languages'
import type { ReviewResult } from '@/lib/review-types'
import { cn } from '@/lib/utils'
import { Bug, BookOpen, Wrench, Upload, Play, Loader2 } from 'lucide-react'

const MODE_ICONS = { detect: Bug, explain: BookOpen, fix: Wrench }

const SAMPLE_CODE = `function getUserData(userId) {
  var query = "SELECT * FROM users WHERE id = " + userId;
  db.execute(query, function(err, result) {
    if (err) console.log(err);
    var data = result[0];
    for (var i = 0; i < data.orders.length; i++) {
      for (var j = 0; j < data.orders.length; j++) {
        if (data.orders[i].id == data.orders[j].id && i != j) {
          data.orders.splice(j, 1);
        }
      }
    }
    return data;
  });
}`

export function ReviewWorkspace() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [mode, setMode] = useState<ReviewMode>('detect')
  const [title, setTitle] = useState('')
  const [sourceType, setSourceType] = useState<'paste' | 'upload'>('paste')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ReviewResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (file.size > 200_000) {
      toast.error('File too large (max 200KB)')
      return
    }
    const text = await file.text()
    setCode(text)
    setSourceType('upload')
    setTitle(file.name)
    const detected = detectLanguageFromFilename(file.name)
    if (detected) setLanguage(detected.id)
    toast.success(`Loaded ${file.name}${detected ? ` (${detected.label})` : ''}`)
  }

  const runReview = async () => {
    if (!code.trim()) {
      toast.error('Paste or upload some code first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, mode, title: title || undefined, sourceType }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Review failed')
        return
      }
      setResult(data.result)
      if (data.result.isCode) {
        toast.success('Review complete and saved to your history')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Code Review Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste code or upload a file, pick a mode, and get an instant AI review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-48"
            aria-label="Review title"
          />
          <Select value={language} onValueChange={(v) => v && setLanguage(v)}>
            <SelectTrigger className="w-44" aria-label="Programming language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mode selector */}
      <div className="mb-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Review mode">
        {MODES.map((m) => {
          const Icon = MODE_ICONS[m.id]
          const active = mode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMode(m.id)}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-muted-foreground/40',
              )}
            >
              <Icon
                className={cn('mt-0.5 h-5 w-5 shrink-0', active ? 'text-primary' : 'text-muted-foreground')}
                aria-hidden="true"
              />
              <span>
                <span className="block text-sm font-semibold text-foreground">{m.label}</span>
                <span className="block text-xs leading-relaxed text-muted-foreground">{m.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Editor */}
      <div className="overflow-hidden rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border bg-card px-3 py-2">
          <span className="font-mono text-xs text-muted-foreground">
            {getLanguage(language)?.label} — {code.split('\n').length} lines
          </span>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) handleFile(f)
                e.target.value = ''
              }}
              aria-label="Upload code file"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCode(SAMPLE_CODE)
                setLanguage('javascript')
                setSourceType('paste')
              }}
            >
              Try sample
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              Upload file
            </Button>
            <Button size="sm" onClick={runReview} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4" aria-hidden="true" />
              )}
              {loading ? 'Reviewing…' : 'Run review'}
            </Button>
          </div>
        </div>
        <div className="h-[420px]">
          <CodeEditor
            value={code}
            onChange={setCode}
            language={getLanguage(language)?.monacoId || 'plaintext'}
          />
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        <ReviewResults
          result={result}
          loading={loading}
          mode={mode}
          code={code}
          language={language}
          title={title || `${getLanguage(language)?.label} review`}
          onApplyFix={(fixed) => {
            setCode(fixed)
            toast.success('Fixed code applied to editor')
          }}
        />
      </div>
    </main>
  )
}
