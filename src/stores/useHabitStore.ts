import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CheckIn, CheckInLocation, Habit } from '../types'

interface HabitState {
  habits: Habit[]
  checkIns: CheckIn[]
  addHabit: (data: { name: string; emoji: string; color: string }) => void
  removeHabit: (id: string) => void
  checkIn: (habitId: string, date: string, extra?: { photo?: string; location?: CheckInLocation }) => void
  uncheck: (habitId: string, date: string) => void
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set) => ({
      habits: [],
      checkIns: [],
      addHabit: ({ name, emoji, color }) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              id: crypto.randomUUID(),
              name,
              emoji,
              color,
              createdAt: Date.now(),
            },
          ],
        })),
      removeHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          checkIns: state.checkIns.filter((c) => c.habitId !== id),
        })),
      checkIn: (habitId, date, extra) =>
        set((state) => {
          const key = `${habitId}_${date}`
          const exists = state.checkIns.find((c) => c.id === key)
          if (exists) {
            return {
              checkIns: state.checkIns.map((c) =>
                c.id === key
                  ? { ...c, photo: extra?.photo, location: extra?.location }
                  : c,
              ),
            }
          }
          return {
            checkIns: [
              ...state.checkIns,
              {
                id: key,
                habitId,
                date,
                createdAt: Date.now(),
                photo: extra?.photo,
                location: extra?.location,
              },
            ],
          }
        }),
      uncheck: (habitId, date) =>
        set((state) => ({
          checkIns: state.checkIns.filter((c) => c.id !== `${habitId}_${date}`),
        })),
    }),
    { name: 'naodong-habit-tracker' },
  ),
)
