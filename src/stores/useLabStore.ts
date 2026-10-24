import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Idea, IdeaMeta } from '../types/lab'

interface LabState {
  ideas: Idea[]
  selectedProjectId: string | null
  addIdea: (title: string, desc?: string) => void
  removeIdea: (id: string) => void
  seedSamples: (samples: { title: string; desc?: string }[]) => void
  importHabits: (items: { title: string; desc?: string; meta?: IdeaMeta }[]) => void
  selectProject: (id: string | null) => void
  reset: () => void
}

export const useLabStore = create<LabState>()(
  persist(
    (set) => ({
      ideas: [],
      selectedProjectId: null,
      addIdea: (title, desc) =>
        set((state) => ({
          ideas: [
            ...state.ideas,
            { id: crypto.randomUUID(), title, desc, createdAt: Date.now() },
          ],
        })),
      removeIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),
      seedSamples: (samples) =>
        set((state) => ({
          ideas: [
            ...state.ideas,
            ...samples.map((s) => ({
              id: crypto.randomUUID(),
              title: s.title,
              desc: s.desc,
              createdAt: Date.now(),
            })),
          ],
        })),
      importHabits: (items) =>
        set((state) => {
          const existing = new Set(state.ideas.map((i) => i.title))
          const fresh = items.filter((i) => !existing.has(i.title))
          return {
            ideas: [
              ...state.ideas,
              ...fresh.map((i) => ({
                id: crypto.randomUUID(),
                title: i.title,
                desc: i.desc,
                createdAt: Date.now(),
                meta: i.meta,
              })),
            ],
          }
        }),
      selectProject: (id) => set({ selectedProjectId: id }),
      reset: () => set({ ideas: [], selectedProjectId: null }),
    }),
    { name: 'naodong-idea-lab' },
  ),
)
