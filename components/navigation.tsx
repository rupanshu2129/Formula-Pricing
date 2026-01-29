'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard,
  Settings,
  PlayCircle,
  Users,
  FileUp,
  FileDown,
  Calendar
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Model Builder', href: '/models', icon: Settings },
  { name: 'Run Pricing', href: '/pricing-runs', icon: PlayCircle },
  { name: 'Customer Groups', href: '/customers', icon: Users },
  { name: 'Exports', href: '/exports', icon: FileDown },
  { name: 'Imports', href: '/imports', icon: FileUp },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
]

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/cargill-logo.svg"
              alt="Cargill Logo"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
            <div className="h-8 w-px bg-gray-300" />
            <Link href="/" className="text-xl font-bold text-primary">
              VAP Formula Pricing
            </Link>
          </div>
          
          <div className="flex space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Admin User</span>
          </div>
        </div>
      </div>
    </nav>
  )
}