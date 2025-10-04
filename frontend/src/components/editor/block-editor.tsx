'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Block {
  id: string
  type: 'paragraph' | 'heading' | 'code' | 'quote' | 'list'
  content: string
  metadata?: Record<string, any>
}

interface BlockEditorProps {
  initialContent?: Block[]
  onChange?: (blocks: Block[]) => void
  placeholder?: string
  className?: string
}

export function BlockEditor({ 
  initialContent = [], 
  onChange, 
  placeholder = "Start writing...",
  className 
}: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(
    initialContent.length > 0 
      ? initialContent 
      : [{ id: generateId(), type: 'paragraph', content: '' }]
  )
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null)

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => {
      const newBlocks = prev.map(block => 
        block.id === id ? { ...block, ...updates } : block
      )
      onChange?.(newBlocks)
      return newBlocks
    })
  }, [onChange])

  const addBlock = useCallback((afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: ''
    }
    
    setBlocks(prev => {
      const index = prev.findIndex(block => block.id === afterId)
      const newBlocks = [
        ...prev.slice(0, index + 1),
        newBlock,
        ...prev.slice(index + 1)
      ]
      onChange?.(newBlocks)
      return newBlocks
    })
    
    setTimeout(() => {
      const element = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement
      element?.focus()
    }, 0)
  }, [onChange])

  const deleteBlock = useCallback((id: string) => {
    if (blocks.length <= 1) return
    
    setBlocks(prev => {
      const newBlocks = prev.filter(block => block.id !== id)
      onChange?.(newBlocks)
      return newBlocks
    })
  }, [blocks.length, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent, blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      addBlock(blockId)
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault()
      deleteBlock(blockId)
    } else if (e.key === '/') {
      setShowBlockMenu(blockId)
    }
  }, [blocks, addBlock, deleteBlock])

  return (
    <div className={cn("max-w-4xl mx-auto", className)}>
      <div className="space-y-2">
        <AnimatePresence>
          {blocks.map((block, index) => (
            <motion.div
              key={block.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="group relative"
            >
              <div className="flex items-start gap-2">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab active:cursor-grabbing"
                  >
                    <GripVertical className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => addBlock(block.id)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <BlockContent
                    block={block}
                    onUpdate={updateBlock}
                    onKeyDown={(e) => handleKeyDown(e, block.id)}
                    onFocus={() => setFocusedBlockId(block.id)}
                    onBlur={() => setFocusedBlockId(null)}
                    placeholder={index === 0 ? placeholder : ""}
                    isFocused={focusedBlockId === block.id}
                  />
                </div>
              </div>
              
              {showBlockMenu === block.id && (
                <BlockMenu
                  onSelect={(type) => {
                    updateBlock(block.id, { type })
                    setShowBlockMenu(null)
                  }}
                  onClose={() => setShowBlockMenu(null)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface BlockContentProps {
  block: Block
  onUpdate: (id: string, updates: Partial<Block>) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onFocus: () => void
  onBlur: () => void
  placeholder: string
  isFocused: boolean
}

function BlockContent({ 
  block, 
  onUpdate, 
  onKeyDown, 
  onFocus, 
  onBlur, 
  placeholder,
  isFocused 
}: BlockContentProps) {
  const handleContentChange = (content: string) => {
    onUpdate(block.id, { content })
  }

  const getBlockElement = () => {
    const baseProps = {
      'data-block-id': block.id,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: (e: React.FormEvent<HTMLElement>) => {
        handleContentChange(e.currentTarget.textContent || '')
      },
      onKeyDown,
      onFocus,
      onBlur,
      className: cn(
        "outline-none border-none resize-none w-full bg-transparent",
        "focus:ring-0 focus:border-none",
        isFocused && "ring-2 ring-primary/20 rounded-md px-2 py-1"
      ),
      placeholder: placeholder,
      dangerouslySetInnerHTML: { __html: block.content }
    }

    switch (block.type) {
      case 'heading':
        return <h2 {...baseProps} className={cn(baseProps.className, "text-2xl font-bold")} />
      case 'code':
        return (
          <pre {...baseProps} className={cn(
            baseProps.className, 
            "font-mono text-sm bg-muted p-3 rounded-md overflow-x-auto"
          )} />
        )
      case 'quote':
        return (
          <blockquote {...baseProps} className={cn(
            baseProps.className,
            "border-l-4 border-primary pl-4 italic text-muted-foreground"
          )} />
        )
      case 'list':
        return <ul {...baseProps} className={cn(baseProps.className, "list-disc pl-6")} />
      default:
        return <p {...baseProps} className={cn(baseProps.className, "min-h-[1.5rem]")} />
    }
  }

  return getBlockElement()
}

interface BlockMenuProps {
  onSelect: (type: Block['type']) => void
  onClose: () => void
}

function BlockMenu({ onSelect, onClose }: BlockMenuProps) {
  const menuItems = [
    { type: 'paragraph' as const, label: 'Paragraph', icon: '¶' },
    { type: 'heading' as const, label: 'Heading', icon: 'H' },
    { type: 'code' as const, label: 'Code', icon: '</>' },
    { type: 'quote' as const, label: 'Quote', icon: '"' },
    { type: 'list' as const, label: 'List', icon: '•' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 z-50 bg-popover border border-border rounded-md shadow-lg p-2 min-w-[200px]"
    >
      {menuItems.map((item) => (
        <Button
          key={item.type}
          variant="ghost"
          className="w-full justify-start gap-3 h-8"
          onClick={() => onSelect(item.type)}
        >
          <span className="font-mono text-xs">{item.icon}</span>
          {item.label}
        </Button>
      ))}
    </motion.div>
  )
}

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}