import { useState } from 'react'
import { useHabitStore } from '../stores/useHabitStore'
import { calcStreak, todayStr } from '../utils/date'
import type { Habit } from '../types'
import CheckInModal from './CheckInModal'

export default function HabitCard({ habit }: { habit: Habit }) {
  const checkIns = useHabitStore((s) => s.checkIns)
  const removeHabit = useHabitStore((s) => s.removeHabit)

  const [open, setOpen] = useState(false)

  const today = todayStr()
  const todayCheckIn = checkIns.find((c) => c.habitId === habit.id && c.date === today)
  const checked = Boolean(todayCheckIn)
  const streak = calcStreak(checkIns, habit.id)

  return (
    <>
      <div
        className="pixel-panel flex items-center gap-4 p-4"
        style={{
          borderColor: checked ? habit.color : 'rgba(120,220,255,0.4)',
          boxShadow: checked
            ? `0 0 0 3px #05050f, 0 0 18px ${habit.color}66`
            : undefined,
        }}
      >
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center border-2 text-2xl"
          style={{
            backgroundColor: `${habit.color}22`,
            borderColor: habit.color,
            boxShadow: `0 0 10px ${habit.color}55`,
          }}
        >
          {habit.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{habit.name}</p>
          <p className="font-pixel mt-1 text-[10px] text-[#00e5ff]">STREAK {streak}</p>
          {todayCheckIn && (todayCheckIn.photo || todayCheckIn.location) && (
            <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
              {todayCheckIn.photo && <span>📷</span>}
              {todayCheckIn.location && <span>📍</span>}
            </div>
          )}
        </div>

        <button
          onClick={() => setOpen(true)}
          className="pixel-btn px-3 py-2 text-sm"
          style={
            checked
              ? { backgroundColor: habit.color, borderColor: habit.color, color: '#05050f' }
              : {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderColor: habit.color,
                  color: habit.color,
                }
          }
        >
          {checked ? '已打卡' : '打卡'}
        </button>

        <button
          onClick={() => removeHabit(habit.id)}
          className="pixel-btn px-2 py-2 text-sm"
          style={{ backgroundColor: 'transparent', borderColor: '#ff2d95', color: '#ff2d95' }}
          title="删除"
        >
          ✕
        </button>
      </div>

      {open && (
        <CheckInModal
          habit={habit}
          existing={todayCheckIn}
          date={today}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
