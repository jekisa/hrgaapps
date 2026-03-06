'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, Users, Package, Wrench, Car, LayoutDashboard,
  ChevronDown, ChevronRight, Bell, FileText, Shield, Activity,
  UserCheck, ClipboardList, Zap, MapPin, Calendar, BookOpen,
  Settings, LogOut, Menu, X
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Manajemen Karyawan',
    icon: Users,
    children: [
      { label: 'Data Karyawan', href: '/karyawan', icon: UserCheck },
      { label: 'Riwayat Jabatan', href: '/karyawan/riwayat', icon: BookOpen },
      { label: 'Status Kontrak', href: '/karyawan/kontrak', icon: ClipboardList },
    ],
  },
  {
    label: 'Manajemen Aset',
    icon: Package,
    children: [
      { label: 'Inventaris Aset', href: '/aset', icon: Package },
      { label: 'Peminjaman Aset', href: '/aset/peminjaman', icon: ClipboardList },
    ],
  },
  {
    label: 'Gedung & Fasilitas',
    icon: Building2,
    children: [
      { label: 'Maintenance Request', href: '/gedung/maintenance', icon: Wrench },
      { label: 'Utilitas', href: '/gedung/utilitas', icon: Zap },
    ],
  },
  {
    label: 'Manajemen Kendaraan',
    icon: Car,
    children: [
      { label: 'Data Kendaraan', href: '/kendaraan', icon: Car },
      { label: 'Jadwal Pemakaian', href: '/kendaraan/jadwal', icon: Calendar },
      { label: 'Log Perjalanan', href: '/kendaraan/log-perjalanan', icon: MapPin },
      { label: 'Perawatan & Servis', href: '/kendaraan/perawatan', icon: Wrench },
      { label: 'Pembayaran Pajak', href: '/kendaraan/pajak', icon: FileText },
    ],
  },
  {
    label: 'Laporan',
    href: '/laporan',
    icon: FileText,
  },
  {
    label: 'Notifikasi',
    href: '/notifikasi',
    icon: Bell,
  },
]

const adminMenuItems = [
  {
    label: 'Manajemen Pengguna',
    href: '/pengguna',
    icon: Shield,
  },
  {
    label: 'Audit Trail',
    href: '/audit-trail',
    icon: Activity,
  },
]

function MenuItem({ item, collapsed }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(
    item.children?.some((c) => pathname.startsWith(c.href)) || false
  )

  const isActive = item.href
    ? item.href === '/'
      ? pathname === '/'
      : pathname.startsWith(item.href)
    : false

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          'sidebar-link',
          isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
        )}
        title={collapsed ? item.label : undefined}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )
  }

  const hasActiveChild = item.children?.some((c) => pathname.startsWith(c.href))

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'sidebar-link w-full',
          hasActiveChild ? 'text-white' : 'sidebar-link-inactive'
        )}
      >
        <item.icon className="w-5 h-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {open ? (
              <ChevronDown className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 shrink-0" />
            )}
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-1 space-y-0.5">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'sidebar-submenu-link',
                  childActive
                    ? 'sidebar-submenu-link-active'
                    : 'sidebar-submenu-link-inactive'
                )}
              >
                <child.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, setCollapsed }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-sidebar z-40 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-none">HRGA Apps</p>
              <p className="text-slate-400 text-xs mt-0.5">Management System</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
            <Building2 className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-slate-400 hover:text-white p-1 rounded transition-colors"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {menuItems.map((item, idx) => (
          <MenuItem key={idx} item={item} collapsed={collapsed} />
        ))}

        {isAdmin && (
          <>
            <div className={cn('mt-4 mb-2', collapsed ? 'hidden' : 'block')}>
              <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Admin
              </p>
            </div>
            {!collapsed && <div className="border-t border-slate-700 my-2" />}
            {adminMenuItems.map((item, idx) => (
              <MenuItem key={idx} item={item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-slate-700 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-slate-400 text-xs truncate">{session?.user?.role}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-slate-400 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex justify-center text-slate-400 hover:text-red-400 transition-colors p-1"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  )
}
