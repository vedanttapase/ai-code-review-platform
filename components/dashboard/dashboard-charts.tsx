'use client'

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const trendConfig = {
  score: { label: 'Score', color: 'var(--chart-1)' },
} satisfies ChartConfig

export function ScoreTrendChart({
  data,
}: {
  data: { id: number; score: number; createdAt: Date | string }[]
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        Run some reviews to see your score trend.
      </p>
    )
  }

  const chartData = data.map((d, i) => ({
    name: `#${i + 1}`,
    score: d.score,
  }))

  return (
    <ChartContainer config={trendConfig} className="h-48 w-full">
      <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis domain={[0, 100]} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="score"
          type="monotone"
          stroke="var(--color-score)"
          fill="var(--color-score)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const langConfig = {
  count: { label: 'Reviews', color: 'var(--chart-2)' },
} satisfies ChartConfig

export function LanguageUsageChart({
  data,
}: {
  data: { language: string; count: number }[]
}) {
  if (data.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No language data yet.
      </p>
    )
  }

  return (
    <ChartContainer config={langConfig} className="h-48 w-full">
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="language" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
