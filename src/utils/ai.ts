import { CLUSTERS, MARKET_INTEL } from '../data/labData'
import type { Idea, Project, ProjectScores } from '../types/lab'
import { totalScore } from './labEngine'

export interface AiConfig {
  baseUrl: string
  apiKey: string
  model: string
}

export const AI_PRESETS = [
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o-mini' },
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: '智谱 GLM', baseUrl: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
  { label: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
  { label: '自定义', baseUrl: '', model: '' },
]

const CONFIG_KEY = 'naodong-ai-config'

export function loadAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return { baseUrl: '', apiKey: '', model: '', ...JSON.parse(raw) }
  } catch {
    // 忽略解析失败，使用空配置
  }
  return { baseUrl: '', apiKey: '', model: '' }
}

export function saveAiConfig(cfg: AiConfig) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg))
}

export function isAiReady(cfg: AiConfig): boolean {
  return Boolean(cfg.baseUrl.trim() && cfg.apiKey.trim() && cfg.model.trim())
}

async function chatJson<T>(cfg: AiConfig, system: string, user: string): Promise<T> {
  if (!isAiReady(cfg)) throw new Error('AI 未配置：请先填写 Base URL、模型名和 API Key')

  const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.6,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`AI 请求失败（${res.status}）：${detail.slice(0, 200)}`)
  }

  const data = await res.json()
  const content: string = data?.choices?.[0]?.message?.content ?? ''
  const start = content.indexOf('{')
  const end = content.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('AI 返回内容不是有效 JSON')
  return JSON.parse(content.slice(start, end + 1)) as T
}

const SYSTEM =
  '你是资深产品研究员与商业模式顾问。你只输出严格的 JSON，不要输出任何解释文字、不要使用 Markdown 代码块。'

function clusterBrief(): string {
  return CLUSTERS.map((c) => `- ${c.id}｜${c.name}｜底层需求：${c.demand}｜赛道：${c.market}`).join('\n')
}

function marketBrief(): string {
  return MARKET_INTEL.map(
    (m) => `- ${m.clusterId}：${m.headline}；${m.figures.join('；')}`,
  ).join('\n')
}

function ideaBrief(ideas: Idea[]): string {
  return ideas
    .map((i) => {
      const meta = i.meta ? `｜累计打卡 ${i.meta.total} 次、连击 ${i.meta.streak} 天` : ''
      return `- ${i.title}${i.desc ? `：${i.desc}` : ''}${meta}`
    })
    .join('\n')
}

export interface AiAssignment {
  idea: string
  clusterId: string
  reason: string
}

export async function aiCluster(cfg: AiConfig, ideas: Idea[]): Promise<AiAssignment[]> {
  const user = `任务：把下列脑洞归类到给定聚类中。

可选聚类：
${clusterBrief()}

待归类脑洞：
${ideaBrief(ideas)}

要求：
1. 每个脑洞必须且只能归入一个聚类 id；
2. reason 用不超过 30 字说明归类依据；
3. 只输出 JSON：{"assignment":[{"idea":"脑洞标题","clusterId":"聚类id","reason":"依据"}]}`

  const raw = await chatJson<{ assignment?: AiAssignment[] }>(cfg, SYSTEM, user)
  const validIds = new Set(CLUSTERS.map((c) => c.id))
  return (raw.assignment ?? []).filter(
    (a) => a && typeof a.idea === 'string' && validIds.has(a.clusterId),
  )
}

export async function aiProjects(
  cfg: AiConfig,
  ideas: Idea[],
  assignments: AiAssignment[],
): Promise<Project[]> {
  const user = `任务：基于脑洞与聚类归属，生成 3 个有差异化的创意项目并评分。

聚类归属结果：
${assignments.map((a) => `- ${a.idea} → ${a.clusterId}（${a.reason}）`).join('\n')}

脑洞明细：
${ideaBrief(ideas)}

参考市场数据（可作为判断依据，不要编造新数字）：
${marketBrief()}

要求：
1. 每个项目融合 2 个不同聚类；
2. scores 五项均为 1-5 的整数：market 市场空间、difficulty 落地容易度、fit 技术契合（纯前端 Web 技术栈）、monetize 变现清晰、risk 合规安全（风险越低分越高）；
3. pitch 一句话讲清产品是什么，不超过 40 字；
4. 只输出 JSON：{"projects":[{"name":"项目名","pitch":"一句话","clusterIds":["id1","id2"],"scores":{"market":4,"difficulty":5,"fit":5,"monetize":3,"risk":4},"rationale":"为什么值得做，不超过 60 字"}]}`

  const raw = await chatJson<{
    projects?: {
      name: string
      pitch: string
      clusterIds: string[]
      scores: ProjectScores
      rationale?: string
    }[]
  }>(cfg, SYSTEM, user)

  const validIds = new Set(CLUSTERS.map((c) => c.id))
  const clamp = (n: unknown) => Math.min(5, Math.max(1, Math.round(Number(n) || 1)))

  return (raw.projects ?? [])
    .filter((p) => p && typeof p.name === 'string' && Array.isArray(p.clusterIds))
    .map((p, index) => {
      const clusterIds = p.clusterIds.filter((id) => validIds.has(id)).slice(0, 2)
      const scores: ProjectScores = {
        market: clamp(p.scores?.market),
        difficulty: clamp(p.scores?.difficulty),
        fit: clamp(p.scores?.fit),
        monetize: clamp(p.scores?.monetize),
        risk: clamp(p.scores?.risk),
      }
      return {
        id: `ai_${index}`,
        name: p.name,
        pitch: p.pitch ?? '',
        clusterIds: clusterIds.length === 2 ? clusterIds : ['inspiration', 'emotion'],
        ideaTitles: ideas
          .filter((i) => clusterIds.includes(assignments.find((a) => a.idea === i.title)?.clusterId ?? ''))
          .map((i) => i.title),
        scores,
        total: totalScore(scores),
      }
    })
}

export interface AiReport {
  positioning: string
  value: string[]
  market: { tam: string; sam: string; som: string }
  competitors: { name: string; edge: string; gap: string }[]
  monetize: { layer: string; price: string; content: string }[]
  swot: { s: string[]; w: string[]; o: string[]; t: string[] }
  roadmap: { phase: string; goal: string; actions: string[]; kpi: string }[]
  risks: { risk: string; level: string; plan: string }[]
  verdict: string
}

export async function aiReport(cfg: AiConfig, project: Project): Promise<AiReport> {
  const clusters = project.clusterIds
    .map((id) => CLUSTERS.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => `${c!.name}（${c!.demand}）`)
    .join(' × ')

  const user = `任务：为下列创意项目撰写商业价值分析与执行规划。

项目：${project.name}
一句话定位：${project.pitch}
融合聚类：${clusters}
关联脑洞：${project.ideaTitles.join('、') || '无'}
本地规则评分：市场 ${project.scores.market}、落地容易度 ${project.scores.difficulty}、技术契合 ${project.scores.fit}、变现 ${project.scores.monetize}、合规 ${project.scores.risk}（满分 5）

参考市场数据（引用时标注来源机构，不要编造新数字）：
${marketBrief()}

要求：
1. 面向中国市场的纯前端 Web 产品，团队 2-4 人；
2. tam/sam/som 使用"金额 + 计算口径"的短句，不要空泛；
3. roadmap 固定 4 个阶段（第 1 月 / 第 2-3 月 / 第 4-6 月 / 第 7-12 月），每阶段给 actions 2-3 条与 1 条 kpi；
4. risks 给 3 条，level 取 高/中/低；
5. 只输出 JSON：{"positioning":"","value":[""],"market":{"tam":"","sam":"","som":""},"competitors":[{"name":"","edge":"","gap":""}],"monetize":[{"layer":"","price":"","content":""}],"swot":{"s":[],"w":[],"o":[],"t":[]},"roadmap":[{"phase":"","goal":"","actions":[],"kpi":""}],"risks":[{"risk":"","level":"","plan":""}],"verdict":""}`

  const raw = await chatJson<Partial<AiReport>>(cfg, SYSTEM, user)
  return {
    positioning: raw.positioning ?? '',
    value: raw.value ?? [],
    market: { tam: '', sam: '', som: '', ...(raw.market ?? {}) },
    competitors: raw.competitors ?? [],
    monetize: raw.monetize ?? [],
    swot: { s: [], w: [], o: [], t: [], ...(raw.swot ?? {}) },
    roadmap: raw.roadmap ?? [],
    risks: raw.risks ?? [],
    verdict: raw.verdict ?? '',
  }
}
