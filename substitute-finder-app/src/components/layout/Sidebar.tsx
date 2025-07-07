import React from 'react'
import { Building, Users, GraduationCap, CalendarDays, Settings, BarChart3 } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: CalendarDays,
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    icon: BarChart3,
  },
  {
    id: 'organizations',
    label: 'Organizations',
    icon: Building,
  },
  {
    id: 'classes',
    label: 'Classes',
    icon: GraduationCap,
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
  },
  {
    id: 'requests',
    label: 'Substitute Requests',
    icon: CalendarDays,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border h-full">
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                currentPage === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
