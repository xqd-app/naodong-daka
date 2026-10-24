import dayjs from 'dayjs'
import type { CheckIn } from '../types'

export function todayStr(): string {
  return dayjs().format('YYYY-MM-DD')
}

export function getLastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    days.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
  }
  return days
}

export function calcStreak(checkIns: CheckIn[], habitId: string): number {
  const dates = new Set(
    checkIns.filter((c) => c.habitId === habitId).map((c) => c.date),
  )
  let cursor = dayjs()
  if (!dates.has(cursor.format('YYYY-MM-DD'))) {
    cursor = cursor.subtract(1, 'day')
  }
  let streak = 0
  while (dates.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }
  return streak
}
