export interface IdeaMeta {
  habitId: string
  emoji: string
  color: string
  total: number
  streak: number
}

export interface Idea {
  id: string
  title: string
  desc?: string
  createdAt: number
  meta?: IdeaMeta
}

export interface Cluster {
  id: string
  name: string
  short: string
  color: string
  keywords: string[]
  demand: string
  market: string
  traits: ProjectScores
  swot: { s: string; w: string; o: string; t: string }
}

export interface ProjectScores {
  market: number
  difficulty: number
  fit: number
  monetize: number
  risk: number
}

export interface MarketSource {
  label: string
  url: string
}

export interface MarketIntel {
  clusterId: string
  headline: string
  figures: string[]
  tam: number // 亿元（中国市场口径）
  sources: MarketSource[]
  query: string
}

export interface Project {
  id: string
  name: string
  pitch: string
  clusterIds: string[]
  ideaTitles: string[]
  scores: ProjectScores
  total: number
}

export type LabStep = 'input' | 'cluster' | 'research' | 'project' | 'report'
