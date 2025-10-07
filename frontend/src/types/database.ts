import { User, Note, Folder, NoteCollaborator } from '@prisma/client'

export type UserWithPreferences = User & {
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    editorMode: 'rich' | 'markdown'
    notifications: boolean
    collaborationSettings: Record<string, any>
  }
  subscription: {
    tier: 'free' | 'pro' | 'enterprise'
    expiresAt: Date | null
  }
}

export type NoteWithDetails = Note & {
  author: User
  folder?: Folder | null
  collaborators: (NoteCollaborator & { user: User })[]
  shareSettings: {
    allowComments: boolean
    allowEditing: boolean
    expiresAt: Date | null
  }
  metadata: {
    wordCount: number
    readingTime: number
    lastEditedBy: string
    version: number
  }
}

export type FolderWithNotes = Folder & {
  owner: User
  parent?: Folder | null
  children: Folder[]
  notes: Note[]
}

export type CreateNoteData = {
  title: string
  content?: Record<string, any>
  folderId?: string
  tags?: string[]
  isPublic?: boolean
}

export type UpdateNoteData = Partial<CreateNoteData> & {
  shareSettings?: {
    allowComments?: boolean
    allowEditing?: boolean
    expiresAt?: Date | null
  }
}

export type CreateFolderData = {
  name: string
  description?: string
  parentId?: string
  color?: string
  icon?: string
}

export type CollaboratorRole = 'viewer' | 'editor' | 'admin'