'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, Users, Package, Wrench, Car, LayoutDashboard,
  ChevronDown, ChevronRight, Bell, FileText, Shield, Activity,
  UserCheck, ClipboardList, Zap, MapPin, Calendar, BookOpen,
  LogOut, PanelLeftClose, PanelLeftOpen
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
  { label: 'Manajemen Pengguna', href: '/pengguna', icon: Shield },
  { label: 'Audit Trail', href: '/audit-trail', icon: Activity },
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
        title={collapsed ? item.label : undefined}
        className={cn(
          'sidebar-link group',
          isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
        )}
      >
        <item.icon className={cn('w-[18px] h-[18px] shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    )
  }

  const hasActiveChild = item.children?.some((c) => pathname.startsWith(c.href))

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? item.label : undefined}
        className={cn(
          'sidebar-link w-full group',
          hasActiveChild ? 'text-white' : 'sidebar-link-inactive'
        )}
      >
        <item.icon className={cn('w-[18px] h-[18px] shrink-0', hasActiveChild ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.label}</span>
            {open ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-60" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
            )}
          </>
        )}
      </button>

      {!collapsed && open && (
        <div className="mt-1 space-y-0.5 animate-fade-in">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'sidebar-submenu-link',
                  childActive ? 'sidebar-submenu-link-active' : 'sidebar-submenu-link-inactive'
                )}
              >
                <child.icon className="w-3.5 h-3.5 shrink-0" />
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
  const userName = session?.user?.name || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out',
        'bg-gradient-to-b from-[#0f172a] to-[#1e293b]',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/5',
        collapsed ? 'px-4 justify-center' : 'px-4 gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0 shadow-sm">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-none tracking-wide">HRGA Apps</p>
            <p className="text-slate-500 text-[10px] mt-0.5 tracking-wider uppercase">Management System</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'text-slate-500 hover:text-slate-300 transition-colors p-1 rounded',
            collapsed && 'hidden'
          )}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-[4.5rem] w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow-md text-white hover:bg-primary-700 transition-colors z-50"
        >
          <PanelLeftOpen className="w-3 h-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
        {menuItems.map((item, idx) => (
          <MenuItem key={idx} item={item} collapsed={collapsed} />
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <div className="pt-4 pb-1">
                <p className="px-3 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                  Admin
                </p>
              </div>
            )}
            {collapsed && <div className="my-2 border-t border-white/5" />}
            {adminMenuItems.map((item, idx) => (
              <MenuItem key={idx} item={item} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold shrink-0 ring-2 ring-primary-500/30">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
              <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 font-medium">
                {session?.user?.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Keluar"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Keluar"
            className="w-full flex justify-center p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}
