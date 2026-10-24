import { useMemo, useState } from 'react'
import { CLUSTERS, SAMPLE_IDEAS } from '../data/labData'
import { useHabitStore } from '../stores/useHabitStore'
import { useLabStore } from '../stores/useLabStore'
import { calcStreak } from '../utils/date'
import {
  clusterIdOf,
  clusterIdeas,
  generateProjects,
  intelOf,
  matchedKeywords,
} from '../utils/labEngine'
import ProjectReport from './ProjectReport'
import AiReport from './AiReport'
import AiSettings from './AiSettings'
import { aiCluster, aiProjects, aiReport, isAiReady, loadAiConfig } from '../utils/ai'
import type { AiAssignment, AiConfig, AiReport as AiReportData } from '../utils/ai'
import type { Idea, Project } from '../types/lab'

const STEPS = ['01 脑洞', '02 归类', '03 调研', '04 项目', '05 规划']

export default function IdeaLab() {
  const ideas = useLabStore((s) => s.ideas)
  const addIdea = useLabStore((s) => s.addIdea)
  const removeIdea = useLabStore((s) => s.removeIdea)
  const seedSamples = useLabStore((s) => s.seedSamples)
  const selectedProjectId = useLabStore((s) => s.selectedProjectId)
  const selectProject = useLabStore((s) => s.selectProject)
  const importHabits = useLabStore((s) => s.importHabits)
  const habits = useHabitStore((s) => s.habits)
  const checkIns = useHabitStore((s) => s.checkIns)

  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')

  const [cfg, setCfg] = useState<AiConfig>(() => loadAiConfig())
  const [assignment, setAssignment] = useState<AiAssignment[] | null>(null)
  const [aiProjectList, setAiProjectList] = useState<Project[] | null>(null)
  const [report, setReport] = useState<AiReportData | null>(null)
  const [busy, setBusy] = useState<'cluster' | 'project' | 'report' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const localGrouped = useMemo(() => clusterIdeas(ideas), [ideas])
  const grouped = useMemo(() => {
    if (!assignment) return localGrouped
    const map = new Map<string, Idea[]>()
    for (const a of assignment) {
      const idea = ideas.find((i) => i.title === a.idea)
      if (idea) map.set(a.clusterId, [...(map.get(a.clusterId) ?? []), idea])
    }
    return CLUSTERS.filter((c) => map.has(c.id)).map((c) => ({
      cluster: c,
      ideas: map.get(c.id)!,
    }))
  }, [assignment, localGrouped, ideas])

  const localProjects = useMemo(() => generateProjects(ideas), [ideas])
  const projects = aiProjectList ?? localProjects
  const unmatched = useMemo(() => ideas.filter((i) => !clusterIdOf(i)), [ideas])
  const selected = projects.find((p) => p.id === selectedProjectId) ?? projects[0]

  const importedTitles = useMemo(() => new Set(ideas.map((i) => i.title)), [ideas])
  const pendingHabits = habits.filter((h) => !importedTitles.has(h.name))

  function handleImportHabits() {
    resetAi()
    importHabits(
      pendingHabits.map((h) => {
        const total = checkIns.filter((c) => c.habitId === h.id).length
        const streak = calcStreak(checkIns, h.id)
        return {
          title: h.name,
          desc: `来自打卡习惯 · 累计 ${total} 次 · 连击 ${streak} 天`,
          meta: { habitId: h.id, emoji: h.emoji, color: h.color, total, streak },
        }
      }),
    )
  }

  function handleAdd() {
    const t = title.trim()
    if (!t) return
    addIdea(t, desc.trim() || undefined)
    setTitle('')
    setDesc('')
    resetAi()
  }

  function resetAi() {
    setAssignment(null)
    setAiProjectList(null)
    setReport(null)
    setError(null)
  }

  async function runCluster() {
    setError(null)
    setBusy('cluster')
    try {
      setAssignment(await aiCluster(cfg, ideas))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function runProjects() {
    setError(null)
    setBusy('project')
    try {
      const asg = assignment ?? (await aiCluster(cfg, ideas))
      setAssignment(asg)
      setAiProjectList(await aiProjects(cfg, ideas, asg))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function runReport() {
    if (!selected) return
    setError(null)
    setBusy('report')
    try {
      setReport(await aiReport(cfg, selected))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      {/* 步骤指示 */}
      <div className="flex gap-1">
        {STEPS.map((s, i) => (
          <button
            key={s}
            onClick={() => setStep(i)}
            className="font-pixel flex-1 border-2 py-2 text-[8px] transition"
            style={{
              borderColor: i === step ? '#00e5ff' : 'rgba(255,255,255,0.12)',
              color: i === step ? '#00e5ff' : 'rgba(255,255,255,0.35)',
              backgroundColor: i === step ? 'rgba(0,229,255,0.1)' : 'transparent',
              boxShadow: i === step ? '0 0 12px rgba(0,229,255,0.4)' : 'none',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <AiSettings cfg={cfg} onSave={setCfg} />

      {error && (
        <div className="pixel-panel p-3" style={{ borderColor: '#ff2d95' }}>
          <p className="text-[11px] text-[#ff2d95]">AI 调用失败</p>
          <p className="mt-1 break-all text-[10px] leading-relaxed text-white/50">{error}</p>
        </div>
      )}

      {/* 01 输入 */}
      {step === 0 && (
        <div className="pixel-panel p-5">
          <p className="font-pixel mb-4 text-[10px] tracking-widest text-[#00e5ff]">▸ 存入你的脑洞</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="脑洞名字，例如：灵感银行"
            className="w-full border-2 border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#00e5ff]"
          />
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="一句话说明它是什么（可选）"
            className="mt-2 w-full border-2 border-white/20 bg-black/40 px-3 py-2 text-sm outline-none focus:border-[#00e5ff]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              className="pixel-btn flex-1 px-4 py-2 text-sm disabled:opacity-40"
              style={{ backgroundColor: '#00e5ff', borderColor: '#00e5ff', color: '#05050f' }}
            >
              存入脑洞
            </button>
            <button
              onClick={handleImportHabits}
              disabled={pendingHabits.length === 0}
              className="pixel-btn px-4 py-2 text-xs disabled:opacity-30"
              style={{ backgroundColor: 'transparent', borderColor: '#39ff14', color: '#39ff14' }}
            >
              ⇩ 导入打卡数据
              {pendingHabits.length > 0 ? ` (${pendingHabits.length})` : ''}
            </button>
            <button
              onClick={() => seedSamples(SAMPLE_IDEAS)}
              className="pixel-btn px-4 py-2 text-xs"
              style={{ backgroundColor: 'transparent', borderColor: '#fff720', color: '#fff720' }}
            >
              载入示例
            </button>
          </div>
          {habits.length > 0 && (
            <p className="mt-2 text-[10px] text-white/30">
              已把打卡习惯视为脑洞来源：导入后会带上该习惯的累计打卡与连击天数，参与后续归类与分析
            </p>
          )}

          <div className="mt-5 space-y-2">
            {ideas.length === 0 && (
              <p className="border border-dashed border-white/15 p-6 text-center text-xs text-white/35">
                还没有脑洞，先存一条，或点「载入示例」看看完整流程
              </p>
            )}
            {ideas.map((idea) => {
              const cid = clusterIdOf(idea)
              const cluster = CLUSTERS.find((c) => c.id === cid)
              return (
                <div
                  key={idea.id}
                  className="flex items-center gap-3 border border-white/10 bg-black/25 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{idea.title}</p>
                    {idea.desc && <p className="truncate text-[11px] text-white/40">{idea.desc}</p>}
                  </div>
                  {cluster && (
                    <span
                      className="shrink-0 border px-2 py-0.5 text-[10px]"
                      style={{ borderColor: cluster.color, color: cluster.color }}
                    >
                      {cluster.short}
                    </span>
                  )}
                  <button
                    onClick={() => removeIdea(idea.id)}
                    className="shrink-0 text-white/30 hover:text-[#ff2d95]"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 02 归类 */}
      {step === 1 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runCluster}
              disabled={busy !== null || !isAiReady(cfg) || ideas.length === 0}
              className="pixel-btn px-3 py-1.5 text-[11px] disabled:opacity-30"
              style={{ backgroundColor: '#bc13fe', borderColor: '#bc13fe', color: '#05050f' }}
            >
              {busy === 'cluster' ? 'AI 归类中…' : '🤖 用 AI 归类'}
            </button>
            {assignment && (
              <button
                onClick={() => setAssignment(null)}
                className="pixel-btn px-3 py-1.5 text-[11px]"
                style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)' }}
              >
                恢复本地规则
              </button>
            )}
            {assignment ? (
              <span className="text-[10px] text-[#39ff14]">当前为 AI 归类结果</span>
            ) : (
              !isAiReady(cfg) && (
                <span className="text-[10px] text-white/35">
                  未配置 AI，展开上方「⚙ AI 设置」即可启用
                </span>
              )
            )}
          </div>
          {grouped.length === 0 ? (
            <div className="pixel-panel p-8 text-center text-xs text-white/40">
              还没有可归类的脑洞，请先回到第 1 步存入
            </div>
          ) : (
            grouped.map(({ cluster, ideas: list }) => (
              <div key={cluster.id} className="pixel-panel p-4" style={{ borderColor: cluster.color }}>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold" style={{ color: cluster.color }}>
                    {cluster.name}
                  </h3>
                  <span className="font-pixel text-[9px] text-white/35">{list.length} 条</span>
                </div>
                <p className="text-[11px] text-white/45">
                  底层需求：{cluster.demand} · 对应赛道：{cluster.market}
                </p>
                <div className="mt-3 space-y-1">
                  {list.map((idea) => {
                    const kws = matchedKeywords(idea, cluster)
                    return (
                      <div key={idea.id} className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-white/70">{idea.title}</span>
                        {idea.meta && (
                          <span className="text-[10px]" style={{ color: idea.meta.color }}>
                            🔥{idea.meta.streak} 连击 / {idea.meta.total} 次打卡
                          </span>
                        )}
                        {kws.length > 0 && (
                          <span className="text-[10px] text-white/30">
                            命中关键词：{kws.join(' / ')}
                          </span>
                        )}
                        {assignment && (
                          <span className="text-[10px] text-[#bc13fe]">
                            AI：{assignment.find((a) => a.idea === idea.title)?.reason}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          {unmatched.length > 0 && (
            <div className="pixel-panel p-4 border-dashed">
              <h3 className="text-sm font-bold text-white/50">待归类</h3>
              <p className="mt-1 text-[11px] text-white/35">
                {unmatched.map((i) => i.title).join('、')}
              </p>
              <p className="mt-2 text-[10px] text-white/25">
                未命中任何聚类关键词，补充描述里的关键词可自动归类
              </p>
            </div>
          )}
        </div>
      )}

      {/* 03 调研 */}
      {step === 2 && (
        <div className="space-y-3">
          <p className="text-[11px] text-white/40">
            以下为已核实的公开市场数据。点击「去搜索」可在浏览器中打开实时检索页，补充最新信息。
          </p>
          {grouped.length === 0 && (
            <div className="pixel-panel p-8 text-center text-xs text-white/40">
              请先在第 1 步存入脑洞
            </div>
          )}
          {grouped.map(({ cluster }) => {
            const intel = intelOf(cluster.id)
            if (!intel) return null
            return (
              <div key={cluster.id} className="pixel-panel p-4" style={{ borderColor: cluster.color }}>
                <h3 className="text-sm font-bold" style={{ color: cluster.color }}>
                  {intel.headline}
                </h3>
                <ul className="mt-2 space-y-1">
                  {intel.figures.map((f) => (
                    <li key={f} className="text-[11px] leading-relaxed text-white/60">
                      · {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex flex-wrap gap-1">
                  {intel.sources.map((s) => (
                    <a
                      key={s.url}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-white/15 px-2 py-1 text-[10px] text-white/45 hover:border-white/40 hover:text-white/80"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <a
                    href={`https://www.bing.com/search?q=${encodeURIComponent(intel.query)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-btn px-3 py-1 text-[10px]"
                    style={{ backgroundColor: 'transparent', borderColor: '#00e5ff', color: '#00e5ff' }}
                  >
                    必应去搜索
                  </a>
                  <a
                    href={`https://www.baidu.com/s?wd=${encodeURIComponent(intel.query)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-btn px-3 py-1 text-[10px]"
                    style={{ backgroundColor: 'transparent', borderColor: '#39ff14', color: '#39ff14' }}
                  >
                    百度去搜索
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 04 项目 */}
      {step === 3 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={runProjects}
              disabled={busy !== null || !isAiReady(cfg) || ideas.length === 0}
              className="pixel-btn px-3 py-1.5 text-[11px] disabled:opacity-30"
              style={{ backgroundColor: '#bc13fe', borderColor: '#bc13fe', color: '#05050f' }}
            >
              {busy === 'project' ? 'AI 生成项目中…' : '🤖 用 AI 生成项目'}
            </button>
            {aiProjectList && (
              <button
                onClick={() => setAiProjectList(null)}
                className="pixel-btn px-3 py-1.5 text-[11px]"
                style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)' }}
              >
                恢复本地组合
              </button>
            )}
            {aiProjectList && <span className="text-[10px] text-[#39ff14]">当前为 AI 生成项目</span>}
          </div>
          {projects.length === 0 ? (
            <div className="pixel-panel p-8 text-center text-xs text-white/40">
              需要至少 1 条可归类的脑洞才能生成项目
            </div>
          ) : (
            <>
              <p className="text-[11px] text-white/40">
                由聚类两两组合生成 {projects.length} 个候选项目，按综合分排序。选一个进入商业分析。
              </p>
              {[...projects]
                .sort((a, b) => b.total - a.total)
                .map((p) => {
                  const isSel = selected?.id === p.id
                  return (
                    <button
                      key={p.id}
                      onClick={() => selectProject(p.id)}
                      className="pixel-panel w-full p-4 text-left transition"
                      style={{
                        borderColor: isSel ? '#39ff14' : 'rgba(120,220,255,0.35)',
                        boxShadow: isSel ? '0 0 0 3px #05050f, 0 0 18px rgba(57,255,20,0.45)' : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold" style={{ color: isSel ? '#39ff14' : '#eaf0ff' }}>
                          {p.name}
                        </h3>
                        <span className="font-pixel text-sm" style={{ color: '#00e5ff' }}>
                          {p.total}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-white/50">{p.pitch}</p>
                      <p className="mt-2 text-[10px] text-white/30">
                        关联脑洞：{p.ideaTitles.join('、') || '（无）'}
                      </p>
                    </button>
                  )
                })}
            </>
          )}
        </div>
      )}

      {/* 05 规划 */}
      {step === 4 &&
        (selected ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={runReport}
                disabled={busy !== null || !isAiReady(cfg)}
                className="pixel-btn px-3 py-1.5 text-[11px] disabled:opacity-30"
                style={{ backgroundColor: '#bc13fe', borderColor: '#bc13fe', color: '#05050f' }}
              >
                {busy === 'report' ? 'AI 生成中…' : '🤖 用 AI 生成分析与规划'}
              </button>
              {report && (
                <button
                  onClick={() => setReport(null)}
                  className="pixel-btn px-3 py-1.5 text-[11px]"
                  style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)' }}
                >
                  隐藏 AI 结果
                </button>
              )}
              {!isAiReady(cfg) && (
                <span className="text-[10px] text-white/35">未配置 AI，下方为本地规则测算</span>
              )}
            </div>
            {report && <AiReport data={report} />}
            <ProjectReport project={selected} />
          </div>
        ) : (
          <div className="pixel-panel p-8 text-center text-xs text-white/40">
            请先在第 1 步存入脑洞
          </div>
        ))}

      {/* 导航 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="pixel-btn px-4 py-2 text-xs disabled:opacity-30"
          style={{ backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.6)' }}
        >
          ◀ 上一步
        </button>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="pixel-btn flex-1 px-4 py-2 text-sm disabled:opacity-30"
          style={{ backgroundColor: '#ff2d95', borderColor: '#ff2d95', color: '#05050f' }}
        >
          下一步 ▶
        </button>
      </div>
    </div>
  )
}
