import { CLUSTERS, MARKET_INTEL, PROJECT_NAMING } from '../data/labData'
import type { Cluster, Idea, MarketIntel, Project, ProjectScores } from '../types/lab'

export function clusterIdOf(idea: Idea): string | null {
  const text = `${idea.title} ${idea.desc ?? ''}`
  let best: { id: string; hits: number } | null = null
  for (const c of CLUSTERS) {
    const hits = c.keywords.filter((k) => text.includes(k)).length
    if (hits > 0 && (!best || hits > best.hits)) best = { id: c.id, hits }
  }
  return best?.id ?? null
}

export function matchedKeywords(idea: Idea, cluster: Cluster): string[] {
  const text = `${idea.title} ${idea.desc ?? ''}`
  return cluster.keywords.filter((k) => text.includes(k))
}

export function clusterIdeas(ideas: Idea[]): { cluster: Cluster; ideas: Idea[] }[] {
  const map = new Map<string, Idea[]>()
  for (const idea of ideas) {
    const cid = clusterIdOf(idea)
    if (!cid) continue
    map.set(cid, [...(map.get(cid) ?? []), idea])
  }
  return CLUSTERS.filter((c) => map.has(c.id))
    .map((c) => ({ cluster: c, ideas: map.get(c.id)! }))
    .sort((a, b) => b.ideas.length - a.ideas.length)
}

export function totalScore(s: ProjectScores): number {
  return Number(
    ((s.market + s.difficulty + s.fit + s.monetize + s.risk) / 5).toFixed(1),
  )
}

export function intelOf(clusterId: string): MarketIntel | undefined {
  return MARKET_INTEL.find((m) => m.clusterId === clusterId)
}

export function generateProjects(ideas: Idea[]): Project[] {
  const grouped = clusterIdeas(ideas)
  if (grouped.length === 0) return []

  let ids = grouped.map((g) => g.cluster.id)
  if (ids.length === 1) {
    const partner = CLUSTERS.filter((c) => c.id !== ids[0]).sort(
      (a, b) => totalScore(b.traits) - totalScore(a.traits),
    )[0]
    ids = [ids[0], partner.id]
  }
  ids = ids.slice(0, 3)

  const pairs: [string, string][] = []
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]])
  }

  return pairs.map(([idA, idB], index) => {
    const a = CLUSTERS.find((c) => c.id === idA)!
    const b = CLUSTERS.find((c) => c.id === idB)!
    const naming = PROJECT_NAMING[index % PROJECT_NAMING.length]
    const scores: ProjectScores = {
      market: Math.round((a.traits.market + b.traits.market) / 2),
      difficulty: Math.round((a.traits.difficulty + b.traits.difficulty) / 2),
      fit: Math.round((a.traits.fit + b.traits.fit) / 2),
      monetize: Math.round((a.traits.monetize + b.traits.monetize) / 2),
      risk: Math.round((a.traits.risk + b.traits.risk) / 2),
    }
    const ideaTitles = ideas
      .filter((i) => {
        const cid = clusterIdOf(i)
        return cid === idA || cid === idB
      })
      .map((i) => i.title)

    return {
      id: `${idA}__${idB}`,
      name: `${a.short}${naming.suffix}`,
      pitch: naming.pitch(a.name, b.name),
      clusterIds: [idA, idB],
      ideaTitles,
      scores,
      total: totalScore(scores),
    }
  })
}

export function buildMarkdown(project: Project, ideas: Idea[]): string {
  const grouped = clusterIdeas(ideas)
  const [a, b] = project.clusterIds.map((id) => CLUSTERS.find((c) => c.id === id)!)
  const intelA = intelOf(a.id)
  const intelB = intelOf(b.id)
  const tam = Math.max(intelA?.tam ?? 0, intelB?.tam ?? 0)
  const sam = Number((tam * 0.1).toFixed(1))
  const som = Number((sam * 0.01).toFixed(2))

  const lines: string[] = []
  lines.push(`# 脑洞创意项目规划书 · ${project.name}`)
  lines.push('')
  lines.push(`> 由「脑洞实验室」自动生成 · 生成时间 ${new Date().toLocaleString('zh-CN')}`)
  lines.push('> 市场数据来自公开研报与媒体，财务数字为演示估算，不构成投资建议。')
  lines.push('')
  lines.push('## 一、脑洞归类整理')
  lines.push('')
  lines.push('| 聚类 | 脑洞 | 底层需求 |')
  lines.push('|------|------|---------|')
  for (const g of grouped) {
    lines.push(
      `| ${g.cluster.name} | ${g.ideas.map((i) => i.title).join('、')} | ${g.cluster.demand} |`,
    )
  }
  lines.push('')
  lines.push('## 二、市场调研摘要')
  lines.push('')
  for (const [cluster, intel] of [
    [a, intelA],
    [b, intelB],
  ] as [Cluster, MarketIntel | undefined][]) {
    if (!intel) continue
    lines.push(`### ${intel.headline}（对应 ${cluster.name}）`)
    for (const f of intel.figures) lines.push(`- ${f}`)
    for (const s of intel.sources) lines.push(`- 来源：[${s.label}](${s.url})`)
    lines.push('')
  }
  lines.push('## 三、创意项目')
  lines.push('')
  lines.push(`**${project.name}** — ${project.pitch}`)
  lines.push('')
  lines.push(`融合聚类：${a.name} × ${b.name}`)
  lines.push(`关联脑洞：${project.ideaTitles.join('、') || '（无）'}`)
  lines.push('')
  lines.push('## 四、商业价值分析')
  lines.push('')
  lines.push('### 4.1 市场空间测算')
  lines.push('')
  lines.push('| 层级 | 口径 | 金额 |')
  lines.push('|------|------|------|')
  lines.push(`| TAM | 对应赛道最大口径 | ${tam} 亿元 |`)
  lines.push(`| SAM | 创意/目标用户子集（取 10%） | ${sam} 亿元 |`)
  lines.push(`| SOM | 3 年获取 SAM 的 1% | ${som} 亿元/年 |`)
  lines.push('')
  lines.push('### 4.2 综合评分')
  lines.push('')
  lines.push('| 维度 | 得分（5 分制） |')
  lines.push('|------|:---:|')
  lines.push(`| 市场空间 | ${project.scores.market} |`)
  lines.push(`| 落地容易度 | ${project.scores.difficulty} |`)
  lines.push(`| 技术契合 | ${project.scores.fit} |`)
  lines.push(`| 变现清晰 | ${project.scores.monetize} |`)
  lines.push(`| 合规安全 | ${project.scores.risk} |`)
  lines.push(`| **综合** | **${project.total}** |`)
  lines.push('')
  lines.push('### 4.3 SWOT')
  lines.push('')
  lines.push(`- **优势 S**：${a.swot.s}；${b.swot.s}`)
  lines.push(`- **劣势 W**：${a.swot.w}；${b.swot.w}`)
  lines.push(`- **机会 O**：${a.swot.o}；${b.swot.o}`)
  lines.push(`- **威胁 T**：${a.swot.t}；${b.swot.t}`)
  lines.push('')
  lines.push('### 4.4 商业模式')
  lines.push('')
  lines.push('- 免费层：核心记录 + 基础统计，建立使用习惯')
  lines.push('- 订阅层：19–29 元/月，AI 能力、无限记录、月度报告')
  lines.push('- 增值层：年度报告、主题皮肤、实体周边')
  lines.push('- B 端：团队版共享空间，按席位计费')
  lines.push('')
  lines.push('## 五、执行规划')
  lines.push('')
  lines.push('**Phase 0 · 概念验证（第 1 个月）**')
  lines.push('- 用现有代码库做最小可用原型，招募 10 名种子用户')
  lines.push('- 成功标准：≥ 6 人连续 7 天产生核心行为')
  lines.push('')
  lines.push('**Phase 1 · MVP（第 2–3 个月）**')
  lines.push('- 上线核心闭环，验证留存')
  lines.push('- 关键指标：次周留存 ≥ 35%')
  lines.push('')
  lines.push('**Phase 2 · 增长（第 4–6 个月）**')
  lines.push('- 上线 AI 能力与社交传播机制')
  lines.push('- 关键指标：MAU 破万，分享率 ≥ 8%')
  lines.push('')
  lines.push('**Phase 3 · 变现（第 7–12 个月）**')
  lines.push('- 订阅 + 增值 + B 端试点')
  lines.push('- 关键指标：付费转化 ≥ 3%，现金流趋近打平')
  lines.push('')
  lines.push('### 风险与应对')
  lines.push('')
  lines.push('| 风险 | 应对 |')
  lines.push('|------|------|')
  lines.push(`| 大厂跟进 | 抢先建立社区与内容网络效应 |`)
  lines.push(`| 数据合规 | 敏感数据端侧优先存储、最小化采集 |`)
  lines.push(`| 冷启动内容不足 | 运营侧先自造高质量种子内容 |`)
  lines.push('')
  lines.push('## 附录 · 数据来源')
  lines.push('')
  const sourceSet = new Map<string, string>()
  for (const intel of [intelA, intelB]) {
    for (const s of intel?.sources ?? []) sourceSet.set(s.label, s.url)
  }
  for (const [label, url] of sourceSet) lines.push(`- [${label}](${url})`)
  lines.push('')

  return lines.join('\n')
}
