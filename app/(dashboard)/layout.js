'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[35] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300 min-w-0',
          collapsed ? 'lg:ml-16' : 'lg:ml-60'
        )}
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
        <footer className="py-3 px-4 lg:px-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          &copy; {new Date().getFullYear()} HRGA Apps - Human Resources & General Affairs Management System
        </footer>
      </div>
    </div>
  )
}
