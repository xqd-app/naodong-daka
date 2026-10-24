import { useState, type FormEvent } from 'react'
import { EMOJI_OPTIONS, NEON_COLORS } from '../types'
import { useHabitStore } from '../stores/useHabitStore'

export default function AddHabitForm() {
  const addHabit = useHabitStore((s) => s.addHabit)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_OPTIONS[0])
  const [color, setColor] = useState<string>(NEON_COLORS[0].value)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    addHabit({ name: trimmed, emoji, color })
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="pixel-panel p-5">
      <h2 className="font-pixel mb-4 text-[10px] tracking-widest text-[#00e5ff]">▸ 新建脑洞习惯</h2>

      <div className="mb-4 flex flex-wrap gap-2">
        {EMOJI_OPTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            className={`h-10 w-10 border-2 text-xl transition ${
              emoji === e ? 'scale-110' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              borderColor: emoji === e ? color : 'rgba(255,255,255,0.15)',
              backgroundColor: emoji === e ? `${color}22` : 'rgba(255,255,255,0.03)',
              boxShadow: emoji === e ? `0 0 12px ${color}` : 'none',
            }}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {NEON_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.name}
            onClick={() => setColor(c.value)}
            className={`h-7 w-7 border-2 transition ${color === c.value ? 'scale-125' : ''}`}
            style={{
              backgroundColor: c.value,
              borderColor: color === c.value ? '#fff' : 'rgba(0,0,0,0.4)',
              boxShadow: `0 0 8px ${c.value}`,
            }}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：每天想 3 个点子"
          className="min-w-0 flex-1 border-2 border-white/20 bg-black/40 px-4 py-2 text-sm outline-none focus:border-[#00e5ff]"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="pixel-btn px-4 py-2 text-sm disabled:opacity-40"
          style={{ backgroundColor: color, color: '#05050f', borderColor: color }}
        >
          添加
        </button>
      </div>
    </form>
  )
}
