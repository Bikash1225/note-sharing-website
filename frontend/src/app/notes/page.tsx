'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Filter, Grid3X3, List } from 'lucide-react'

export default function NotesPage() {
  const sampleNotes = [
    {
      id: '1',
      title: 'Getting Started with Next.js 15',
      excerpt: 'Learn about the latest features in Next.js 15 including Turbopack and improved performance.',
      tags: ['nextjs', 'react', 'web-development'],
      createdAt: '2024-01-15',
      readingTime: 5,
      isPublic: false,
    },
    {
      id: '2',
      title: 'Advanced TypeScript Patterns',
      excerpt: 'Explore advanced TypeScript patterns for building scalable applications.',
      tags: ['typescript', 'patterns', 'programming'],
      createdAt: '2024-01-14',
      readingTime: 8,
      isPublic: true,
    },
    {
      id: '3',
      title: 'UI Design Principles',
      excerpt: 'Key principles for creating beautiful and functional user interfaces.',
      tags: ['design', 'ui', 'ux'],
      createdAt: '2024-01-13',
      readingTime: 3,
      isPublic: false,
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Notes</h1>
          <p className="text-gray-600">
            Manage and organize all your notes in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notes..."
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-r-none border-r border-gray-300"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {sampleNotes.length} notes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleNotes.map((note) => (
            <Card key={note.id} className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </CardTitle>
                  {note.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Public
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  {note.excerpt}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{note.readingTime} min read</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}