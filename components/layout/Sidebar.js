'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Building2, Users, Package, Wrench, Car, LayoutDashboard,
  ChevronDown, ChevronRight, BellRing, FileBarChart2, ShieldCheck, Activity,
  UserCircle2, History, TimerReset, Boxes, ArrowRightLeft,
  Construction, Zap, CarFront, Calendar, Route, Receipt,
  LogOut, PanelLeftClose, PanelLeftOpen, Sparkles, X
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
      { label: 'Data Karyawan', href: '/karyawan', icon: UserCircle2 },
      { label: 'Riwayat Jabatan', href: '/karyawan/riwayat', icon: History },
      { label: 'Status Kontrak', href: '/karyawan/kontrak', icon: TimerReset },
    ],
  },
  {
    label: 'Manajemen Aset',
    icon: Package,
    children: [
      { label: 'Inventaris Aset', href: '/aset', icon: Boxes },
      { label: 'Peminjaman Aset', href: '/aset/peminjaman', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'Gedung & Fasilitas',
    icon: Building2,
    children: [
      { label: 'Maintenance Request', href: '/gedung/maintenance', icon: Construction },
      { label: 'Utilitas', href: '/gedung/utilitas', icon: Zap },
    ],
  },
  {
    label: 'Manajemen Kendaraan',
    icon: Car,
    children: [
      { label: 'Data Kendaraan', href: '/kendaraan', icon: CarFront },
      { label: 'Jadwal Pemakaian', href: '/kendaraan/jadwal', icon: Calendar },
      { label: 'Log Perjalanan', href: '/kendaraan/log-perjalanan', icon: Route },
      { label: 'Perawatan & Servis', href: '/kendaraan/perawatan', icon: Wrench },
      { label: 'Pembayaran Pajak', href: '/kendaraan/pajak', icon: Receipt },
    ],
  },
  {
    label: 'Laporan',
    href: '/laporan',
    icon: FileBarChart2,
  },
  {
    label: 'Notifikasi',
    href: '/notifikasi',
    icon: BellRing,
  },
]

const adminMenuItems = [
  { label: 'Manajemen Pengguna', href: '/pengguna', icon: ShieldCheck },
  { label: 'Audit Trail', href: '/audit-trail', icon: Activity },
]

function MenuItem({ item, collapsed, onMobileClose }) {
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
      <div className="tooltip-wrap">
        <Link
          href={item.href}
          onClick={onMobileClose}
          className={cn(
            'sidebar-link group',
            isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'
          )}
        >
          <item.icon className={cn(
            'w-[18px] h-[18px] shrink-0 transition-transform duration-200',
            isActive ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
          )} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </Link>
        {collapsed && <span className="tooltip-label">{item.label}</span>}
      </div>
    )
  }

  const hasActiveChild = item.children?.some((c) => pathname.startsWith(c.href))

  return (
    <div>
      <div className="tooltip-wrap">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'sidebar-link w-full group',
            hasActiveChild ? 'text-white' : 'sidebar-link-inactive'
          )}
          style={hasActiveChild ? {
            background: 'rgba(255,255,255,0.06)',
          } : {}}
        >
          <item.icon className={cn(
            'w-[18px] h-[18px] shrink-0 transition-transform duration-200',
            hasActiveChild ? 'text-white' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
          )} />
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.label}</span>
              <span className={cn(
                'w-4 h-4 shrink-0 transition-transform duration-300',
                open ? 'rotate-90' : 'rotate-0'
              )}>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </span>
            </>
          )}
        </button>
        {collapsed && <span className="tooltip-label">{item.label}</span>}
      </div>

      {!collapsed && open && (
        <div className="mt-1 space-y-0.5 animate-slide-down">
          {item.children.map((child) => {
            const childActive = pathname === child.href || pathname.startsWith(child.href + '/')
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onMobileClose}
                className={cn(
                  'sidebar-submenu-link group',
                  childActive ? 'sidebar-submenu-link-active' : 'sidebar-submenu-link-inactive'
                )}
              >
                <child.icon className={cn(
                  'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
                  childActive ? 'text-primary-300' : 'text-slate-600 group-hover:scale-110'
                )} />
                <span className="truncate">{child.label}</span>
                {childActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const userName = session?.user?.name || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // On mobile, sidebar is always rendered expanded (never icon-only)
  const showCollapsed = collapsed && !isMobile
  const onMobileClose = isMobile ? () => setMobileOpen(false) : undefined

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out',
        'bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#1a2332]',
        // Always w-60 on mobile; w-16/w-60 based on collapsed state on desktop
        'w-60',
        collapsed && 'lg:w-16',
        // Mobile: slide in/out; Desktop: always visible
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
      style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.25)' }}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-white/5 px-4 gap-3',
        showCollapsed && 'lg:justify-center lg:gap-0'
      )}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-md relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
        >
          <Building2 className="w-4 h-4 text-white relative z-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
        </div>

        {!showCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-white font-bold text-sm leading-none tracking-wide">HRGA Apps</p>
              <Sparkles className="w-3 h-3 text-primary-400 animate-pulse-slow" />
            </div>
            <p className="text-slate-500 text-[10px] mt-0.5 tracking-wider uppercase">Management System</p>
          </div>
        )}

        {/* Desktop collapse button - only shown when not collapsed */}
        {!showCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-slate-500 hover:text-slate-200 transition-all duration-200 p-1 rounded hover:bg-white/5 shrink-0"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden ml-auto text-slate-500 hover:text-slate-200 transition-all duration-200 p-1 rounded hover:bg-white/5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Desktop-only floating expand button (when collapsed) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex absolute -right-3 top-[4.5rem] w-6 h-6 items-center justify-center rounded-full text-white shadow-lg z-50 transition-transform duration-200 hover:scale-110"
          style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}
        >
          <PanelLeftOpen className="w-3 h-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
        {menuItems.map((item, idx) => (
          <MenuItem key={idx} item={item} collapsed={showCollapsed} onMobileClose={onMobileClose} />
        ))}

        {isAdmin && (
          <>
            {!showCollapsed && (
              <div className="pt-4 pb-1">
                <div className="flex items-center gap-2 px-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1">
                    Admin
                  </p>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              </div>
            )}
            {showCollapsed && <div className="my-2 border-t border-white/5" />}
            {adminMenuItems.map((item, idx) => (
              <MenuItem key={idx} item={item} collapsed={showCollapsed} onMobileClose={onMobileClose} />
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 p-3">
        {!showCollapsed ? (
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-lg">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary-500/40"
                style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)' }}
              >
                {initials}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f172a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{userName}</p>
              <span className="inline-block mt-0.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide"
                style={{ background: 'rgba(37,99,235,0.2)', color: '#93c5fd' }}
              >
                {session?.user?.role}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Keluar"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 group"
            >
              <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>
        ) : (
          <div className="tooltip-wrap">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex justify-center p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 group"
            >
              <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
            <span className="tooltip-label">Keluar</span>
          </div>
        )}
      </div>
    </aside>
  )
}
