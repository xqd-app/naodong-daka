import { useState } from 'react'
import AddHabitForm from './components/AddHabitForm'
import HabitCard from './components/HabitCard'
import Heatmap from './components/Heatmap'
import IdeaLab from './components/IdeaLab'
import PixelBackground from './components/PixelBackground'
import { useHabitStore } from './stores/useHabitStore'
import { todayStr } from './utils/date'

type Tab = 'quest' | 'lab'

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="pixel-panel px-3 py-3 text-center" style={{ borderColor: color }}>
      <p className="font-pixel text-xl" style={{ color, textShadow: `0 0 8px ${color}` }}>
        {value}
      </p>
      <p className="mt-2 text-[11px] tracking-widest text-white/60">{label}</p>
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>('quest')
  const habits = useHabitStore((s) => s.habits)
  const checkIns = useHabitStore((s) => s.checkIns)
  const today = todayStr()
  const todayCount = checkIns.filter((c) => c.date === today).length

  return (
    <div className="relative min-h-screen px-4 py-10">
      <PixelBackground />

      {/* CRT 扫描线覆盖层 */}
      <div
        className="pointer-events-none fixed inset-0 z-[9999]"
        style={{
          background:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 3px)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-2xl">
        <header className="mb-6 text-center">
          <p className="font-pixel mb-4 text-[10px] tracking-widest text-[#00e5ff]">
            ◤ BRAIN HABIT QUEST ◢
          </p>
          <h1 className="pixel-title text-4xl sm:text-5xl">
            脑洞打卡器<span className="blink">▮</span>
          </h1>
          <p className="mt-4 text-xs tracking-widest text-white/50">让每个脑洞都发光 · 2D 像素闯关</p>
        </header>

        {/* 顶部导航 */}
        <nav className="mb-8 flex gap-2">
          {(
            [
              { id: 'quest', label: '▸ 习惯打卡', color: '#39ff14' },
              { id: 'lab', label: '▸ 脑洞实验室', color: '#ff2d95' },
            ] as { id: Tab; label: string; color: string }[]
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="font-pixel flex-1 border-2 py-2 text-[9px] transition"
              style={{
                borderColor: tab === t.id ? t.color : 'rgba(255,255,255,0.12)',
                color: tab === t.id ? t.color : 'rgba(255,255,255,0.4)',
                backgroundColor: tab === t.id ? `${t.color}18` : 'transparent',
                boxShadow: tab === t.id ? `0 0 14px ${t.color}55` : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === 'quest' ? (
          <>
            <div className="mb-8 grid grid-cols-3 gap-3">
              <Stat label="脑洞习惯" value={habits.length} color="#39ff14" />
              <Stat label="今日打卡" value={todayCount} color="#00e5ff" />
              <Stat label="累计打卡" value={checkIns.length} color="#ff2d95" />
            </div>

            <AddHabitForm />

            <div className="mt-6 space-y-4">
              {habits.length === 0 ? (
                <div className="pixel-panel p-10 text-center text-sm text-white/40">
                  还没有脑洞习惯，先在上方创建一个吧 💡
                </div>
              ) : (
                habits.map((h) => <HabitCard key={h.id} habit={h} />)
              )}
            </div>

            <Heatmap />
          </>
        ) : (
          <IdeaLab />
        )}
      </div>
    </div>
  )
}
