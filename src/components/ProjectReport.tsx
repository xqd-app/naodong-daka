import { useState } from 'react'
import { CLUSTERS } from '../data/labData'
import type { Project, ProjectScores } from '../types/lab'
import { useLabStore } from '../stores/useLabStore'
import { buildMarkdown, intelOf } from '../utils/labEngine'

const SCORE_LABELS: { key: keyof ProjectScores; label: string }[] = [
  { key: 'market', label: '市场空间' },
  { key: 'difficulty', label: '落地容易度' },
  { key: 'fit', label: '技术契合' },
  { key: 'monetize', label: '变现清晰' },
  { key: 'risk', label: '合规安全' },
]

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 shrink-0 text-white/50">{label}</span>
      <div className="h-2 flex-1 bg-white/10">
        <div
          className="h-full transition-all"
          style={{ width: `${(value / 5) * 100}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>
      <span className="font-pixel w-8 text-right text-[10px]" style={{ color }}>
        {value}
      </span>
    </div>
  )
}

export default function ProjectReport({ project }: { project: Project }) {
  const ideas = useLabStore((s) => s.ideas)
  const [mau, setMau] = useState(100000)
  const [conv, setConv] = useState(3)
  const [price, setPrice] = useState(25)

  const clusters = project.clusterIds.map((id) => CLUSTERS.find((c) => c.id === id)!)
  const intels = project.clusterIds.map((id) => intelOf(id)).filter(Boolean)
  const tam = Math.max(...intels.map((i) => i!.tam))
  const sam = tam * 0.1
  const som = sam * 0.01
  const arr = (mau * (conv / 100) * price * 12) / 10000

  function handleDownload() {
    const md = buildMarkdown(project, ideas)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}_规划书.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="pixel-panel p-5">
        <p className="font-pixel mb-3 text-[10px] tracking-widest text-[#39ff14]">▸ 商业价值分析</p>
        <h3 className="text-lg font-bold" style={{ color: '#39ff14' }}>
          {project.name}
        </h3>
        <p className="mt-2 text-sm text-white/60">{project.pitch}</p>
        <div className="mt-4 space-y-2">
          {SCORE_LABELS.map((s) => (
            <ScoreBar
              key={s.key}
              label={s.label}
              value={project.scores[s.key]}
              color={clusters[0].color}
            />
          ))}
        </div>
        <p className="font-pixel mt-4 text-center text-xl" style={{ color: '#00e5ff' }}>
          TOTAL {project.total}
        </p>
      </div>

      <div className="pixel-panel p-5">
        <p className="font-pixel mb-3 text-[10px] tracking-widest text-[#00e5ff]">▸ 市场空间测算</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { k: 'TAM', v: `${tam.toFixed(0)} 亿`, d: '赛道大盘' },
            { k: 'SAM', v: `${sam.toFixed(1)} 亿`, d: '可服务市场' },
            { k: 'SOM', v: `${som.toFixed(2)} 亿`, d: '3 年可获取' },
          ].map((x) => (
            <div key={x.k} className="border border-white/10 bg-black/30 p-2">
              <p className="font-pixel text-[10px] text-white/40">{x.k}</p>
              <p className="mt-1 text-sm font-bold text-[#00e5ff]">{x.v}</p>
              <p className="mt-1 text-[10px] text-white/40">{x.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          口径说明：TAM 取对应赛道最大公开口径；SAM 按创意/目标用户子集 10% 估算；SOM 按 3 年获取 SAM 的 1% 估算。
        </p>
      </div>

      <div className="pixel-panel p-5">
        <p className="font-pixel mb-3 text-[10px] tracking-widest text-[#ff2d95]">▸ 收入试算</p>
        <div className="grid grid-cols-3 gap-3">
          <label className="text-xs text-white/50">
            目标 MAU
            <input
              type="number"
              value={mau}
              onChange={(e) => setMau(Number(e.target.value) || 0)}
              className="mt-1 w-full border-2 border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-[#ff2d95]"
            />
          </label>
          <label className="text-xs text-white/50">
            付费转化 %
            <input
              type="number"
              value={conv}
              onChange={(e) => setConv(Number(e.target.value) || 0)}
              className="mt-1 w-full border-2 border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-[#ff2d95]"
            />
          </label>
          <label className="text-xs text-white/50">
            月费 元
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="mt-1 w-full border-2 border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-[#ff2d95]"
            />
          </label>
        </div>
        <p className="mt-3 text-sm">
          年订阅收入约{' '}
          <span className="font-pixel text-lg" style={{ color: '#ff2d95' }}>
            {arr.toFixed(1)} 万元
          </span>
        </p>
      </div>

      <div className="pixel-panel p-5">
        <p className="font-pixel mb-3 text-[10px] tracking-widest text-[#fff720]">▸ SWOT</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { k: 'S 优势', v: clusters.map((c) => c.swot.s).join('；'), c: '#39ff14' },
            { k: 'W 劣势', v: clusters.map((c) => c.swot.w).join('；'), c: '#ff9f1a' },
            { k: 'O 机会', v: clusters.map((c) => c.swot.o).join('；'), c: '#00e5ff' },
            { k: 'T 威胁', v: clusters.map((c) => c.swot.t).join('；'), c: '#ff2d95' },
          ].map((x) => (
            <div key={x.k} className="border border-white/10 bg-black/30 p-3">
              <p className="font-pixel text-[10px]" style={{ color: x.c }}>
                {x.k}
              </p>
              <p className="mt-2 text-[11px] leading-relaxed text-white/60">{x.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pixel-panel p-5">
        <p className="font-pixel mb-3 text-[10px] tracking-widest text-[#bc13fe]">▸ 执行规划</p>
        <ol className="space-y-3">
          {[
            { t: 'Phase 0 · 概念验证 · 第 1 个月', d: '用现有代码库做最小原型，招募 10 名种子用户；成功标准：≥6 人连续 7 天产生核心行为' },
            { t: 'Phase 1 · MVP · 第 2–3 个月', d: '上线核心闭环验证留存；关键指标：次周留存 ≥ 35%' },
            { t: 'Phase 2 · 增长 · 第 4–6 个月', d: '上线 AI 能力与社交传播；关键指标：MAU 破万、分享率 ≥ 8%' },
            { t: 'Phase 3 · 变现 · 第 7–12 个月', d: '订阅 + 增值 + B 端试点；关键指标：付费转化 ≥ 3%、现金流趋近打平' },
          ].map((p, i) => (
            <li key={p.t} className="flex gap-3">
              <span
                className="font-pixel mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[9px]"
                style={{ backgroundColor: '#bc13fe', color: '#05050f' }}
              >
                {i}
              </span>
              <div>
                <p className="text-xs font-bold text-white/80">{p.t}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-white/45">{p.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <button
        onClick={handleDownload}
        className="pixel-btn w-full px-4 py-3 text-sm"
        style={{ backgroundColor: '#39ff14', borderColor: '#39ff14', color: '#05050f' }}
      >
        ⬇ 导出完整规划书（Markdown）
      </button>
    </div>
  )
}
