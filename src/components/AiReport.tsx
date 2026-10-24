import type { AiReport as AiReportData } from '../utils/ai'

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="pixel-panel p-4" style={{ borderColor: color }}>
      <p className="font-pixel mb-3 text-[10px] tracking-widest" style={{ color }}>
        ▸ {title}
      </p>
      {children}
    </div>
  )
}

export default function AiReport({ data }: { data: AiReportData }) {
  return (
    <div className="space-y-3">
      <div
        className="pixel-panel p-4"
        style={{ borderColor: '#39ff14', boxShadow: '0 0 18px rgba(57,255,20,0.25)' }}
      >
        <div className="flex items-center justify-between">
          <p className="font-pixel text-[10px] tracking-widest text-[#39ff14]">▸ AI 商业分析与规划</p>
          <span className="border border-[#39ff14]/40 px-2 py-0.5 text-[10px] text-[#39ff14]">
            AI 生成
          </span>
        </div>
        {data.positioning && <p className="mt-3 text-sm leading-relaxed text-white/80">{data.positioning}</p>}
        {data.value.length > 0 && (
          <ul className="mt-3 space-y-1">
            {data.value.map((v) => (
              <li key={v} className="text-[11px] text-white/55">
                · {v}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Section title="市场空间" color="#00e5ff">
        <div className="space-y-1 text-[11px] leading-relaxed text-white/60">
          <p>
            <span className="font-pixel mr-2 text-[9px] text-[#00e5ff]">TAM</span>
            {data.market.tam}
          </p>
          <p>
            <span className="font-pixel mr-2 text-[9px] text-[#00e5ff]">SAM</span>
            {data.market.sam}
          </p>
          <p>
            <span className="font-pixel mr-2 text-[9px] text-[#00e5ff]">SOM</span>
            {data.market.som}
          </p>
        </div>
      </Section>

      {data.competitors.length > 0 && (
        <Section title="竞争格局" color="#bc13fe">
          <div className="space-y-2">
            {data.competitors.map((c) => (
              <div key={c.name} className="border border-white/10 bg-black/30 p-2">
                <p className="text-xs font-bold text-white/80">{c.name}</p>
                <p className="mt-1 text-[10px] text-white/45">优势：{c.edge}</p>
                <p className="text-[10px] text-[#ff2d95]">空位：{c.gap}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.monetize.length > 0 && (
        <Section title="商业模式" color="#fff720">
          <div className="space-y-1">
            {data.monetize.map((m) => (
              <div key={m.layer} className="flex gap-2 text-[11px]">
                <span className="w-16 shrink-0 text-[#fff720]">{m.layer}</span>
                <span className="w-20 shrink-0 text-white/50">{m.price}</span>
                <span className="flex-1 text-white/60">{m.content}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="SWOT" color="#39ff14">
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['S 优势', data.swot.s, '#39ff14'],
              ['W 劣势', data.swot.w, '#ff9f1a'],
              ['O 机会', data.swot.o, '#00e5ff'],
              ['T 威胁', data.swot.t, '#ff2d95'],
            ] as [string, string[], string][]
          ).map(([label, items, color]) => (
            <div key={label} className="border border-white/10 bg-black/30 p-2">
              <p className="font-pixel text-[9px]" style={{ color }}>
                {label}
              </p>
              <ul className="mt-1 space-y-0.5">
                {items.map((i) => (
                  <li key={i} className="text-[10px] leading-relaxed text-white/55">
                    · {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {data.roadmap.length > 0 && (
        <Section title="执行规划" color="#bc13fe">
          <ol className="space-y-3">
            {data.roadmap.map((p, i) => (
              <li key={p.phase} className="flex gap-3">
                <span
                  className="font-pixel mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-[9px]"
                  style={{ backgroundColor: '#bc13fe', color: '#05050f' }}
                >
                  {i}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white/80">
                    {p.phase} · {p.goal}
                  </p>
                  <ul className="mt-1 space-y-0.5">
                    {p.actions.map((a) => (
                      <li key={a} className="text-[10px] leading-relaxed text-white/45">
                        · {a}
                      </li>
                    ))}
                  </ul>
                  {p.kpi && <p className="mt-1 text-[10px] text-[#39ff14]">KPI：{p.kpi}</p>}
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {data.risks.length > 0 && (
        <Section title="风险与应对" color="#ff9f1a">
          <div className="space-y-2">
            {data.risks.map((r) => (
              <div key={r.risk} className="border border-white/10 bg-black/30 p-2">
                <p className="text-[11px] text-white/75">
                  <span className="mr-2 text-[10px]" style={{ color: '#ff9f1a' }}>
                    [{r.level}]
                  </span>
                  {r.risk}
                </p>
                <p className="mt-1 text-[10px] text-white/45">应对：{r.plan}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.verdict && (
        <div className="pixel-panel p-4" style={{ borderColor: '#ff2d95' }}>
          <p className="font-pixel mb-2 text-[10px] tracking-widest text-[#ff2d95]">▸ 结论</p>
          <p className="text-xs leading-relaxed text-white/70">{data.verdict}</p>
        </div>
      )}
    </div>
  )
}
