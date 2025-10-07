'use client'

import { motion } from 'framer-motion'
import { formatRelativeTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Star, 
  Share2, 
  Trash2, 
  Edit,
  Clock,
  User
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface NoteCardProps {
  note: {
    id: string
    title: string
    excerpt?: string | null
    tags: string[]
    createdAt: Date
    updatedAt: Date
    isPublic: boolean
    author: {
      id: string
      username: string
      displayName?: string | null
      avatar?: string | null
    }
    folder?: {
      id: string
      name: string
      color: string
    } | null
    metadata: {
      wordCount: number
      readingTime: number
    }
  }
  onDelete?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function NoteCard({ note, onDelete, onToggleFavorite, isFavorite }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="group relative bg-card border border-border rounded-lg p-4 hover:shadow-lg transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link href={`/notes/${note.id}`}>
            <h3 className="font-semibold text-lg line-clamp-2 hover:text-primary transition-colors">
              {note.title}
            </h3>
          </Link>
          {note.folder && (
            <div className="flex items-center gap-1 mt-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: note.folder.color }}
              />
              <span className="text-xs text-muted-foreground">
                {note.folder.name}
              </span>
            </div>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/notes/${note.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleFavorite?.(note.id)}>
              <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onDelete?.(note.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {note.excerpt && (
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {note.excerpt}
        </p>
      )}

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {note.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{note.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {note.metadata.readingTime} min read
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {note.author.displayName || note.author.username}
          </div>
        </div>
        <div>
          {formatRelativeTime(note.updatedAt)}
        </div>
      </div>

      {note.isPublic && (
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="text-xs">
            Public
          </Badge>
        </div>
      )}
    </motion.div>
  )
}