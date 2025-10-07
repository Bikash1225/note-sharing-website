'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Home, 
  FileText, 
  Folder, 
  Star, 
  Archive, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  closed: {
    x: -320,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'All Notes', href: '/notes' },
  { icon: Star, label: 'Favorites', href: '/favorites' },
  { icon: Archive, label: 'Archive', href: '/archive' },
  { icon: Trash2, label: 'Trash', href: '/trash' },
]

const folders = [
  { id: '1', name: 'Work', color: '#3b82f6', count: 12 },
  { id: '2', name: 'Personal', color: '#10b981', count: 8 },
  { id: '3', name: 'Projects', color: '#f59e0b', count: 15 },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['folders'])

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    )
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? "open" : "closed"}
        className="fixed left-0 top-16 bottom-0 w-80 bg-card border-r border-border z-50 lg:relative lg:top-0 lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-border">
            <Button className="w-full justify-start gap-2" size="sm">
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start gap-3 h-10"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}

            <div className="pt-4">
              <Button
                variant="ghost"
                className="w-full justify-between h-8 px-2 text-sm font-medium"
                onClick={() => toggleFolder('folders')}
              >
                <span>Folders</span>
                {expandedFolders.includes('folders') ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>

              <AnimatePresence>
                {expandedFolders.includes('folders') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1 mt-2">
                      {folders.map((folder) => (
                        <Button
                          key={folder.id}
                          variant="ghost"
                          className="w-full justify-start gap-3 h-8 pl-6"
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: folder.color }}
                          />
                          <span className="flex-1 text-left">{folder.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {folder.count}
                          </span>
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-8 pl-6 text-muted-foreground"
                      >
                        <Plus className="h-3 w-3" />
                        Add Folder
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  )
}