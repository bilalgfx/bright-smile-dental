'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Phone,
  LogOut,
  Menu,
  X,
  Stethoscope
} from 'lucide-react'

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { label: 'Patients', href: '/dashboard/patients', icon: Users },
  { label: 'Call Logs', href: '/dashboard/calls', icon: Phone },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('dental_auth')
    if (!auth) router.push('/')
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('dental_auth')
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Bright Smile</p>
              <p className="text-xs text-gray-500">Dental Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                  ${active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-semibold">Dr</span>
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              Dr. Smith
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}