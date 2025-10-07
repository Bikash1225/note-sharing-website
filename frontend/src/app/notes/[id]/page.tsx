import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { BlockEditor } from '@/components/editor/block-editor'
import { getNote } from '@/lib/actions/notes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import { Edit, Share2, Star, MoreHorizontal } from 'lucide-react'

interface NotePageProps {
  params: {
    id: string
  }
}

async function NoteContent({ noteId }: { noteId: string }) {
  try {
    const note = await getNote(noteId)
    
    const breadcrumbItems = [
      { label: 'Notes', href: '/notes' },
      { label: note.title, isActive: true }
    ]

    return (
      <div className="space-y-6">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
          <div className="flex items-start justify-between mt-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{note.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>By {note.author.displayName || note.author.username}</span>
                <span>•</span>
                <span>{formatRelativeTime(note.updatedAt)}</span>
                <span>•</span>
                <span>{(note.metadata as any).readingTime} min read</span>
                {note.isPublic && (
                  <>
                    <span>•</span>
                    <Badge variant="outline">Public</Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {note.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <BlockEditor 
            initialContent={note.content as any || []}
            className="border-none"
          />
        </div>
      </div>
    )
  } catch (error) {
    notFound()
  }
}

export default function NotePage({ params }: NotePageProps) {
  return (
    <MainLayout>
      <Suspense fallback={<div>Loading note...</div>}>
        <NoteContent noteId={params.id} />
      </Suspense>
    </MainLayout>
  )
}