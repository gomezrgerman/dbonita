'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export interface GlowMenuItem {
  icon: LucideIcon
  label: string
  href: string
  gradient: string
  iconColor: string
}

interface MenuBarProps {
  className?: string
  items: GlowMenuItem[]
  activeItem?: string
  onItemClick?: (label: string, href: string) => void
  variant?: 'light' | 'dark'
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: {
    opacity: 1,
    scale: 2,
    transition: {
      opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
      scale: { duration: 0.5, type: 'spring', stiffness: 300, damping: 25 },
    },
  },
}

const navGlowVariants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

export function MenuBar({ className, items, activeItem, onItemClick, variant = 'light' }: MenuBarProps) {
  const textColor = variant === 'dark'
    ? 'rgba(255,255,255,0.7)'
    : 'var(--color-text-muted)'
  const activeTextColor = variant === 'dark' ? '#fff' : '#1A3A4A'
  return (
    <motion.nav
      className={cn('relative', className)}
    >
      <ul className="flex items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = item.label === activeItem

          return (
            <motion.li key={item.label} className="relative">
              <button
                onClick={() => onItemClick?.(item.label, item.href)}
                className="block w-full"
              >
                <motion.div
                  className="block rounded-xl overflow-visible relative"
                  style={{ perspective: '600px' }}
                  whileHover="hover"
                  initial="initial"
                >
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 relative z-10 rounded-xl'
                    )}
                    variants={itemVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center bottom',
                      color: isActive ? activeTextColor : textColor,
                    }}
                  >
                    <span className={cn('transition-colors duration-300', isActive ? item.iconColor : '')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 rounded-xl'
                    )}
                    variants={backVariants}
                    transition={sharedTransition}
                    style={{
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'center top',
                      rotateX: 90,
                      color: isActive ? activeTextColor : textColor,
                    }}
                  >
                    <span className={cn('transition-colors duration-300', isActive ? item.iconColor : '')}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </motion.div>
                </motion.div>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </motion.nav>
  )
}