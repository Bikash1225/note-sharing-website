import { render, screen, fireEvent } from '@testing-library/react'
import { NoteCard } from '@/components/notes/note-card'

const mockNote = {
  id: '1',
  title: 'Test Note',
  excerpt: 'This is a test note excerpt',
  tags: ['test', 'example'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-02'),
  isPublic: false,
  author: {
    id: 'user1',
    username: 'testuser',
    displayName: 'Test User',
    avatar: undefined,
  },
  folder: {
    id: 'folder1',
    name: 'Test Folder',
    color: '#3b82f6',
  },
  metadata: {
    wordCount: 100,
    readingTime: 1,
  },
}

describe('NoteCard', () => {
  it('renders note information correctly', () => {
    render(<NoteCard note={mockNote} />)
    
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    expect(screen.getByText('This is a test note excerpt')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('example')).toBeInTheDocument()
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('1 min read')).toBeInTheDocument()
  })

  it('calls onDelete when delete is clicked', () => {
    const onDelete = jest.fn()
    render(<NoteCard note={mockNote} onDelete={onDelete} />)
    
    const moreButton = screen.getByRole('button', { name: /more/i })
    fireEvent.click(moreButton)
    
    const deleteButton = screen.getByText('Delete')
    fireEvent.click(deleteButton)
    
    expect(onDelete).toHaveBeenCalledWith('1')
  })

  it('shows public badge for public notes', () => {
    const publicNote = { ...mockNote, isPublic: true }
    render(<NoteCard note={publicNote} />)
    
    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('shows favorite state correctly', () => {
    render(<NoteCard note={mockNote} isFavorite={true} />)
    
    const moreButton = screen.getByRole('button', { name: /more/i })
    fireEvent.click(moreButton)
    
    expect(screen.getByText('Remove from favorites')).toBeInTheDocument()
  })
})