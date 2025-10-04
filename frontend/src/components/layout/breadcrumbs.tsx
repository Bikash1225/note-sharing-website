'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      <Link 
        href="/dashboard" 
        className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <motion.div
          key={`${item.label}-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center space-x-1"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          {item.href && !item.isActive ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              item.isActive ? "text-foreground font-medium" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  )
}