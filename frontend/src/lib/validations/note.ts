import { z } from 'zod'

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.record(z.any()).optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

export const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string(),
})

export const shareNoteSchema = z.object({
  noteId: z.string(),
  allowComments: z.boolean().optional(),
  allowEditing: z.boolean().optional(),
  expiresAt: z.date().optional(),
})

export const collaboratorSchema = z.object({
  noteId: z.string(),
  userId: z.string(),
  role: z.enum(['viewer', 'editor', 'admin']),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
export type ShareNoteInput = z.infer<typeof shareNoteSchema>
export type CollaboratorInput = z.infer<typeof collaboratorSchema>