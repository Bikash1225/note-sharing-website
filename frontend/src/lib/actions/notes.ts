'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.record(z.any()).optional(),
  folderId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
})

const updateNoteSchema = createNoteSchema.partial().extend({
  id: z.string(),
})

export async function createNote(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get or create user in our database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  const validatedFields = createNoteSchema.safeParse({
    title: formData.get('title'),
    content: formData.get('content') ? JSON.parse(formData.get('content') as string) : {},
    folderId: formData.get('folderId') || undefined,
    tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [],
    isPublic: formData.get('isPublic') === 'true',
  })

  if (!validatedFields.success) {
    throw new Error('Invalid fields')
  }

  const { title, content, folderId, tags, isPublic } = validatedFields.data

  try {
    const note = await prisma.note.create({
      data: {
        title,
        content: content || {},
        authorId: user.id,
        folderId,
        tags: tags || [],
        isPublic: isPublic || false,
        excerpt: generateExcerpt(content),
        metadata: {
          wordCount: calculateWordCount(content),
          readingTime: calculateReadingTime(content),
          version: 1,
          lastEditedBy: user.id,
        },
      },
    })

    revalidatePath('/notes')
    return { success: true, note }
  } catch (error) {
    console.error('Failed to create note:', error)
    throw new Error('Failed to create note')
  }
}

export async function updateNote(formData: FormData) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get or create user in our database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  const validatedFields = updateNoteSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    content: formData.get('content') ? JSON.parse(formData.get('content') as string) : undefined,
    folderId: formData.get('folderId') || undefined,
    tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
    isPublic: formData.get('isPublic') ? formData.get('isPublic') === 'true' : undefined,
  })

  if (!validatedFields.success) {
    throw new Error('Invalid fields')
  }

  const { id, title, content, folderId, tags, isPublic } = validatedFields.data

  try {
    const existingNote = await prisma.note.findUnique({
      where: { id },
      select: { authorId: true, metadata: true },
    })

    if (!existingNote || existingNote.authorId !== user.id) {
      throw new Error('Note not found or unauthorized')
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) {
      updateData.content = content
      updateData.excerpt = generateExcerpt(content)
    }
    if (folderId !== undefined) updateData.folderId = folderId
    if (tags !== undefined) updateData.tags = tags
    if (isPublic !== undefined) updateData.isPublic = isPublic

    if (Object.keys(updateData).length > 0) {
      const currentMetadata = existingNote.metadata as any
      updateData.metadata = {
        ...currentMetadata,
        wordCount: content ? calculateWordCount(content) : currentMetadata.wordCount,
        readingTime: content ? calculateReadingTime(content) : currentMetadata.readingTime,
        version: currentMetadata.version + 1,
        lastEditedBy: user.id,
      }
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
    })

    revalidatePath('/notes')
    revalidatePath(`/notes/${id}`)
    return { success: true, note }
  } catch (error) {
    console.error('Failed to update note:', error)
    throw new Error('Failed to update note')
  }
}

export async function deleteNote(noteId: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get or create user in our database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { authorId: true },
    })

    if (!note || note.authorId !== user.id) {
      throw new Error('Note not found or unauthorized')
    }

    await prisma.note.delete({
      where: { id: noteId },
    })

    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete note:', error)
    throw new Error('Failed to delete note')
  }
}

export async function getNotes(folderId?: string) {
  const { userId } = await auth()
  if (!userId) {
    return []
  }

  // Get or create user in our database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    return []
  }

  try {
    const notes = await prisma.note.findMany({
      where: {
        authorId: user.id,
        folderId: folderId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return notes
  } catch (error) {
    console.error('Failed to fetch notes:', error)
    return []
  }
}

export async function getNote(noteId: string) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Get or create user in our database
  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    throw new Error('User not found')
  }

  try {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
          },
        },
        folder: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        collaborators: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!note) {
      throw new Error('Note not found')
    }

    if (note.authorId !== user.id && !note.isPublic) {
      const isCollaborator = note.collaborators.some(
        (collab) => collab.userId === user.id
      )
      if (!isCollaborator) {
        throw new Error('Unauthorized')
      }
    }

    return note
  } catch (error) {
    console.error('Failed to fetch note:', error)
    throw error
  }
}

function generateExcerpt(content: any): string {
  if (!content || typeof content !== 'object') return ''
  
  const text = extractTextFromContent(content)
  return text.slice(0, 200) + (text.length > 200 ? '...' : '')
}

function extractTextFromContent(content: any): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map(extractTextFromContent).join(' ')
  }
  if (content && typeof content === 'object') {
    if (content.text) return content.text
    if (content.content) return extractTextFromContent(content.content)
    return Object.values(content).map(extractTextFromContent).join(' ')
  }
  return ''
}

function calculateWordCount(content: any): number {
  const text = extractTextFromContent(content)
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

function calculateReadingTime(content: any): number {
  const wordCount = calculateWordCount(content)
  return Math.ceil(wordCount / 200) // Assuming 200 words per minute
}