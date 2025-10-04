'use client'

import { useState } from 'react'
import { Header } from './header'
import { Sidebar } from './sidebar'
import { Toaster } from '@/components/ui/toaster'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      <div className="flex pt-16">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="flex-1 lg:ml-80">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
}