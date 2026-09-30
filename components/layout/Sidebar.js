'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  AlarmClockCheck, Landmark, UsersRound, PackageOpen, Wrench, CarFront, Gauge,
  ChevronRight, BellDot, ChartNoAxesCombined, ShieldCheck, ScanLine,
  ContactRound, History, Hourglass, Boxes, Repeat2,
  HardHat, PlugZap, CalendarClock, MapPinned, ReceiptText,
  LogOut, PanelLeftClose, PanelLeftOpen, UserX, X, CalendarDays, CalendarCheck, MoreHorizontal
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import dashboardMenu from '@/lib/dashboard-menu'
import AppLogo from '@/components/ui/AppLogo'

const { getVisibleSidebarItems } = dashboardMenu

const menuItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Gauge,
  },
  {
    label: 'Reminder',
    href: '/reminder',
    icon: AlarmClockCheck,
  },
  {
    label: 'Notifikasi',
    href: '/notifikasi',
    icon: BellDot,
  },
  {
    label: 'Cuti Saya',
    roles: ['STAFF'],
    icon: CalendarDays,
    href: '/cuti/saya/ajukan',
  },
  {
    section: 'Manajemen SDM',
  },
  {
    label: 'Manajemen Karyawan',
    icon: UsersRound,
    children: [
      { label: 'Data Karyawan', href: '/karyawan', icon: ContactRound },
      { label: 'Karyawan Nonaktif', href: '/karyawan/nonactive', icon: UserX },
      { label: 'Riwayat Jabatan', href: '/karyawan/riwayat', icon: History },
      { label: 'Status Kontrak', href: '/karyawan/kontrak', icon: Hourglass },
    ],
  },
  {
    label: 'Manajemen Cuti',
    roles: ['ADMIN'],
    icon: CalendarDays,
    children: [
      { label: 'Daftar Pengajuan', href: '/cuti/kelola', icon: CalendarCheck },
      { label: 'Kelola Jenis Cuti', href: '/cuti/jenis', icon: CalendarDays },
      { label: 'Rekap Cuti Karyawan', href: '/cuti/rekap', icon: ChartNoAxesCombined },
      { label: 'Surat Dokter', href: '/cuti/surat-dokter', icon: ReceiptText },
    ],
  },
  {
    section: 'Manajemen Aset',
  },
  {
    label: 'Manajemen Aset',
    icon: PackageOpen,
    children: [
      { label: 'Inventaris Aset', href: '/aset', icon: Boxes },
      { label: 'Peminjaman Aset', href: '/aset/peminjaman', icon: Repeat2 },
    ],
  },
  {
    label: 'Manajemen Kendaraan',
    icon: CarFront,
    children: [
      { label: 'Data Kendaraan', href: '/kendaraan', icon: CarFront },
      { label: 'Jadwal Pemakaian', href: '/kendaraan/jadwal', icon: CalendarClock },
      { label: 'Log Perjalanan', href: '/kendaraan/log-perjalanan', icon: MapPinned },
      { label: 'Perawatan & Servis', href: '/kendaraan/perawatan', icon: Wrench },
      { label: 'Pembayaran Pajak', href: '/kendaraan/pajak', icon: ReceiptText },
    ],
  },
  {
    label: 'Gedung & Fasilitas',
    icon: Landmark,
    children: [
      { label: 'Maintenance Request', href: '/gedung/maintenance', icon: HardHat },
      { label: 'Utilitas', href: '/gedung/utilitas', icon: PlugZap },
    ],
  },
  {
    section: 'Laporan',
  },
  {
    label: 'Laporan',
    href: '/laporan',
    icon: ChartNoAxesCombined,
  },
]

const adminMenuItems = [
  { label: 'Manajemen Pengguna', href: '/pengguna', icon: ShieldCheck },
  { label: 'Audit Trail', href: '/audit-trail', icon: ScanLine },
]

const staffMenuItems = [
  { label: 'Dashboard', href: '/', icon: Gauge },
  { label: 'Reminder', href: '/reminder', icon: AlarmClockCheck },
  { label: 'Notifikasi', href: '/notifikasi', icon: BellDot },
  { label: 'Cuti Saya', href: '/cuti/saya/ajukan', icon: CalendarDays },
]

export function MobileBottomNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [moreOpen, setMoreOpen] = useState(false)
  const role = session?.user?.role
  const isStaff = role === 'STAFF'
  const navItems = [
    { label: 'Dashboard', href: '/', icon: Gauge },
    { label: 'Reminder', href: '/reminder', icon: AlarmClockCheck },
    { label: 'Notifikasi', href: '/notifikasi', icon: BellDot },
    { label: isStaff ? 'Cuti Saya' : 'Manajemen Cuti', href: isStaff ? '/cuti/saya/ajukan' : '/cuti/kelola', icon: CalendarDays },
  ]
  const visibleItems = getVisibleSidebarItems(role, menuItems, staffMenuItems)
  const moreItems = [
    ...visibleItems.filter((item) => item.section || !['Dashboard', 'Reminder', 'Notifikasi', 'Cuti Saya', 'Manajemen Cuti'].includes(item.label)),
    ...(role === 'ADMIN' ? [{ section: 'Admin' }, ...adminMenuItems] : []),
  ]
  const hasMore = moreItems.some((item) => !item.section)

  useEffect(() => {
    if (!moreOpen) return
    const onKeyDown = (event) => event.key === 'Escape' && setMoreOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [moreOpen])

  if (!role) return null

  return (
    <>
      {moreOpen && (
        <div className="mobile-more-overlay md:hidden" onClick={() => setMoreOpen(false)}>
          <section className="mobile-more-sheet" role="dialog" aria-modal="true" aria-label="Menu lainnya" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-more-handle" />
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-slate-900">Menu lainnya</h2>
              <button type="button" aria-label="Tutup menu" onClick={() => setMoreOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            {hasMore ? <nav className="mobile-more-list">
              {moreItems.map((item, index) => item.section ? (
                <p key={`section-${item.section}-${index}`} className="mobile-more-section">{item.section}</p>
              ) : item.children ? (
                <div key={item.label} className="mobile-more-group">
                  <p className="mobile-more-group-title"><item.icon className="h-4 w-4" />{item.label}</p>
                  {item.children.map((child) => <Link key={child.href} href={child.href} onClick={() => setMoreOpen(false)} className="mobile-more-link mobile-more-child"><child.icon className="h-4 w-4" />{child.label}</Link>)}
                </div>
              ) : <Link key={item.href} href={item.href} onClick={() => setMoreOpen(false)} className="mobile-more-link"><item.icon className="h-4 w-4" />{item.label}</Link>)}
            </nav> : <p className="px-2 py-5 text-center text-sm text-slate-500">Tidak ada menu lainnya untuk akun ini.</p>}
          </section>
        </div>
      )}
      <nav className="mobile-bottom-nav md:hidden" data-role={role || 'ADMIN'} aria-label="Navigasi utama">
        {navItems.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.label === 'Manajemen Cuti' && pathname.startsWith('/cuti/'))
          return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} className={`mobile-bottom-link ${active ? 'mobile-bottom-link-active' : ''}`}>
            <item.icon className="h-5 w-5" aria-hidden="true" /><span>{item.label}</span>
          </Link>
        })}
        <button type="button" onClick={() => setMoreOpen(true)} aria-expanded={moreOpen} className={`mobile-bottom-link ${moreOpen ? 'mobile-bottom-link-active' : ''}`}>
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" /><span>Lainnya</span>
        </button>
      </nav>
    </>
  )
}

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
  const isStaff = session?.user?.role === 'STAFF'
  const visibleMenuItems = getVisibleSidebarItems(session?.user?.role, menuItems, staffMenuItems)
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
      data-role={isStaff ? 'STAFF' : undefined}
      data-admin={isAdmin ? 'true' : undefined}
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
        'flex items-center h-16 shrink-0 border-b border-white/5 px-4 gap-3',
        showCollapsed && 'lg:justify-center lg:gap-0'
      )}>
        <AppLogo
          className={!showCollapsed ? 'flex-1 min-w-0' : undefined}
          markClassName="w-8 h-8"
          showWordmark={!showCollapsed}
          wordmarkClassName="text-white text-sm"
          subtitleClassName="text-slate-500"
          sparkle
        />
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
      <nav className="flex-1 min-h-0 overflow-y-auto px-2.5 py-4 space-y-0.5">
        {visibleMenuItems.map((item, idx) => (
          item.roles && !item.roles.includes(session?.user?.role) ? null : (
          item.section ? (
            !showCollapsed ? (
              <div key={idx} className="pt-5 pb-2">
                <div className="flex items-center gap-3 px-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{item.section}</p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              </div>
            ) : (
              <div key={idx} className="my-2 border-t border-white/5" />
            )
          ) : (
            <MenuItem key={idx} item={item} collapsed={showCollapsed} onMobileClose={onMobileClose} />
          )
          )
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
      <div data-sidebar-footer className="shrink-0 border-t border-white/5 p-3">
        {!showCollapsed ? (
          <div className="flex items-center gap-2.5 px-1 py-1 rounded-lg">
            <div className={cn('relative shrink-0', isAdmin && 'admin-avatar-ring')}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold', isAdmin ? 'admin-avatar-core' : 'ring-2 ring-primary-500/40')}
                style={{ background: isAdmin ? 'var(--admin-gradient-indigo)' : 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)' }}
              >
                {initials}
              </div>
              <div className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0f172a]', isAdmin && 'admin-avatar-status')} />
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
