export interface Habit {
  id: string
  name: string
  emoji: string
  color: string
  createdAt: number
}

export interface CheckInLocation {
  lat: number
  lng: number
  address?: string
}

export interface CheckIn {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  photo?: string
  location?: CheckInLocation
  createdAt: number
}

export const NEON_COLORS = [
  { name: '荧光绿', value: '#39ff14' },
  { name: '霓虹粉', value: '#ff2d95' },
  { name: '霓虹蓝', value: '#00e5ff' },
  { name: '霓虹紫', value: '#bc13fe' },
  { name: '霓虹橙', value: '#ff9f1a' },
  { name: '霓虹黄', value: '#fff720' },
] as const

export const EMOJI_OPTIONS = ['💡', '✍️', '🎨', '🧠', '📖', '🎵', '🏃', '🌱', '🚀', '🧪']
