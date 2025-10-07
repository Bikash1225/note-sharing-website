import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'

interface User {
  id: string
  email: string
  username: string
  displayName?: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    editorMode: 'rich' | 'markdown'
    notifications: boolean
    collaborationSettings: Record<string, any>
  }
}

interface Note {
  id: string
  title: string
  content: Record<string, any>
  excerpt?: string
  authorId: string
  folderId?: string
  tags: string[]
  isPublic: boolean
  shareSettings: {
    allowComments: boolean
    allowEditing: boolean
    expiresAt?: Date
  }
  metadata: {
    wordCount: number
    readingTime: number
    version: number
  }
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

interface AppState {
  user: User | null
  notes: Note[]
  selectedNote: Note | null
  isLoading: boolean
  error: string | null
  
  setUser: (user: User | null) => void
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setSelectedNote: (note: Note | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      user: null,
      notes: [],
      selectedNote: null,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set((state) => {
          state.user = user
        }),

      setNotes: (notes) =>
        set((state) => {
          state.notes = notes
        }),

      addNote: (note) =>
        set((state) => {
          state.notes.unshift(note)
        }),

      updateNote: (id, updates) =>
        set((state) => {
          const index = state.notes.findIndex((note) => note.id === id)
          if (index !== -1) {
            Object.assign(state.notes[index], updates)
          }
          if (state.selectedNote?.id === id) {
            Object.assign(state.selectedNote, updates)
          }
        }),

      deleteNote: (id) =>
        set((state) => {
          state.notes = state.notes.filter((note) => note.id !== id)
          if (state.selectedNote?.id === id) {
            state.selectedNote = null
          }
        }),

      setSelectedNote: (note) =>
        set((state) => {
          state.selectedNote = note
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
        }),
    }))
  )
)