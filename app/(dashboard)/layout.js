'use client'

import { useState } from 'react'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          collapsed ? 'ml-16' : 'ml-64'
        )}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
        <footer className="py-3 px-6 text-center text-xs text-gray-400 border-t border-gray-100 bg-white">
          &copy; {new Date().getFullYear()} HRGA Apps - Human Resources & General Affairs Management System
        </footer>
      </div>
    </div>
  )
}
