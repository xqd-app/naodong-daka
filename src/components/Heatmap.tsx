import dayjs from 'dayjs'
import { useHabitStore } from '../stores/useHabitStore'

const DAYS = 70

function buildWeeks(): (string | null)[][] {
  const today = dayjs()
  const start = today.subtract(DAYS - 1, 'day')
  const padBefore = start.day()
  const cells: (string | null)[] = []
  for (let i = 0; i < padBefore; i++) cells.push(null)
  for (let i = 0; i < DAYS; i++) {
    cells.push(today.subtract(DAYS - 1 - i, 'day').format('YYYY-MM-DD'))
  }
  const weeks: (string | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

function cellColor(count: number): string {
  if (count === 0) return 'rgba(255,255,255,0.06)'
  const a = Math.min(0.35 + count * 0.22, 1)
  return `rgba(0, 229, 255, ${a})`
}

export default function Heatmap() {
  const checkIns = useHabitStore((s) => s.checkIns)
  const countMap: Record<string, number> = {}
  for (const c of checkIns) {
    countMap[c.date] = (countMap[c.date] ?? 0) + 1
  }

  const weeks = buildWeeks()
  const today = dayjs().format('YYYY-MM-DD')

  return (
    <section className="pixel-panel mt-8 p-5">
      <h2 className="font-pixel mb-4 text-[10px] tracking-widest text-[#00e5ff]">
        ▸ 打卡热力图 · 70 DAYS
      </h2>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((date, di) => {
              if (date === null) return <span key={di} className="h-3 w-3" />
              const count = countMap[date] ?? 0
              return (
                <span
                  key={di}
                  className="h-3 w-3"
                  title={`${date} · ${count} 次打卡`}
                  style={{
                    backgroundColor: cellColor(count),
                    boxShadow: date === today ? '0 0 6px rgba(0,229,255,0.8)' : 'none',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-white/40">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className="h-3 w-3" style={{ backgroundColor: cellColor(n) }} />
        ))}
        <span>多</span>
      </div>
    </section>
  )
}
