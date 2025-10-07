'use client'

import { motion } from 'framer-motion'
import { Button, ButtonProps } from './button'
import { cn } from '@/lib/utils'

interface AnimatedButtonProps extends ButtonProps {
  animation?: 'scale' | 'bounce' | 'pulse' | 'shake'
  children: React.ReactNode
}

const animations = {
  scale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
    transition: { type: "spring", stiffness: 400, damping: 17 }
  },
  bounce: {
    whileHover: { y: -2 },
    whileTap: { y: 0 },
    transition: { type: "spring", stiffness: 400, damping: 10 }
  },
  pulse: {
    whileHover: { scale: [1, 1.05, 1] },
    transition: { duration: 0.3, repeat: Infinity }
  },
  shake: {
    whileHover: { x: [-1, 1, -1, 1, 0] },
    transition: { duration: 0.3 }
  }
}

export function AnimatedButton({ 
  animation = 'scale', 
  className, 
  children, 
  ...props 
}: AnimatedButtonProps) {
  return (
    <motion.div
      className="inline-block"
      {...animations[animation]}
    >
      <Button
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {children}
      </Button>
    </motion.div>
  )
}