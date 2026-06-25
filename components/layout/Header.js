'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BellDot,
  CarFront,
  ChevronDown,
  FileText,
  LogOut,
  MessageSquareText,
  PackageCheck,
  PanelLeftOpen,
  Search,
  Sparkles,
  CheckCheck,
  Menu,
  UsersRound,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const notifColor = (tipe) => {
  const map = {
    KONTRAK:     'text-blue-600 bg-blue-50 border-blue-100',
    ULANG_TAHUN: 'text-pink-600 bg-pink-50 border-pink-100',
    SERVIS:      'text-orange-600 bg-orange-50 border-orange-100',
    PAJAK:       'text-red-600 bg-red-50 border-red-100',
  }
  return map[tipe] || 'text-gray-600 bg-gray-50 border-gray-100'
}

const notifDot = (tipe) => {
  const map = {
    KONTRAK:     'bg-blue-500',
    ULANG_TAHUN: 'bg-pink-500',
    SERVIS:      'bg-orange-500',
    PAJAK:       'bg-red-500',
  }
  return map[tipe] || 'bg-gray-400'
}

const searchGroups = [
  {
    key: 'karyawan',
    label: 'Karyawan',
    icon: UsersRound,
    href: '/karyawan',
    endpoint: '/api/karyawan',
    getTitle: (item) => item.nama,
    getSubtitle: (item) => [item.nik, item.jabatan, item.departemen].filter(Boolean).join(' · '),
    getHref: (item) => `/karyawan/${item._id || item.id}`,
    iconClass: 'bg-blue-50 text-blue-600',
  },
  {
    key: 'aset',
    label: 'Aset',
    icon: PackageCheck,
    href: '/aset',
    endpoint: '/api/aset',
    getTitle: (item) => item.namaAset,
    getSubtitle: (item) => [item.kodeAset, item.kategori, item.status].filter(Boolean).join(' · '),
    getHref: (_item, term) => `/aset?search=${encodeURIComponent(term)}`,
    iconClass: 'bg-emerald-50 text-emerald-600',
  },
  {
    key: 'kendaraan',
    label: 'Kendaraan',
    icon: CarFront,
    href: '/kendaraan',
    endpoint: '/api/kendaraan',
    getTitle: (item) => item.noPol,
    getSubtitle: (item) => [item.merk, item.model, item.status].filter(Boolean).join(' · '),
    getHref: (_item, term) => `/kendaraan?search=${encodeURIComponent(term)}`,
    iconClass: 'bg-violet-50 text-violet-600',
  },
]

const reportResults = [
  { title: 'Laporan Karyawan', subtitle: 'Export data karyawan', href: '/laporan', icon: FileText },
  { title: 'Laporan Inventaris Aset', subtitle: 'Export data aset', href: '/laporan', icon: FileText },
  { title: 'Laporan Kendaraan', subtitle: 'Export data kendaraan', href: '/laporan', icon: FileText },
]

export default function Header({ collapsed, setCollapsed, setMobileOpen }) {
  const { data: session } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState({})
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  const { data: notifData } = useQuery({
    queryKey: ['notifications-header'],
    queryFn: () => fetch('/api/notifikasi?limit=5').then(r => r.json()),
    refetchInterval: 60000,
  })

  const notifications = notifData?.data || []
  const unreadCount = notifData?.unreadCount || 0

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
      queryClient.invalidateQueries({ queryKey: ['notifications-header'] })
    } catch {}
  }

  const userName = session?.user?.name || 'User'
  const initials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const now = new Date()
  const dayName = now.toLocaleDateString('id-ID', { weekday: 'long' })
  const dateStr = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const normalizedSearch = searchTerm.trim()
  const hasSearchResults = searchGroups.some((group) => searchResults[group.key]?.length) || searchResults.laporan?.length

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        searchInputRef.current?.focus()
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }

    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (normalizedSearch.length < 2) {
      setSearchResults({})
      setSearchLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const requests = searchGroups.map(async (group) => {
          const params = new URLSearchParams({ search: normalizedSearch, limit: '4' })
          const response = await fetch(`${group.endpoint}?${params}`, { signal: controller.signal })
          const payload = response.ok ? await response.json() : { data: [] }
          return [group.key, payload.data || []]
        })

        const entries = await Promise.all(requests)
        const reportMatch = /laporan|report|export|excel/i.test(normalizedSearch)
          ? reportResults
          : reportResults.filter((item) => item.title.toLowerCase().includes(normalizedSearch.toLowerCase()))

        setSearchResults({ ...Object.fromEntries(entries), laporan: reportMatch })
      } catch (error) {
        if (error.name !== 'AbortError') setSearchResults({})
      } finally {
        if (!controller.signal.aborted) setSearchLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [normalizedSearch])

  const closeSearch = () => {
    setSearchOpen(false)
    setSearchTerm('')
    setSearchResults({})
  }

  const goToSearch = (href) => {
    router.push(href)
    closeSearch()
  }

  const submitSearch = (event) => {
    event.preventDefault()
    if (!normalizedSearch) {
      searchInputRef.current?.focus()
      return
    }

    const firstGroup = searchGroups.find((group) => searchResults[group.key]?.length)
    const firstItem = firstGroup ? searchResults[firstGroup.key][0] : null
    const reportItem = searchResults.laporan?.[0]

    if (firstGroup && firstItem) {
      goToSearch(firstGroup.getHref(firstItem, normalizedSearch))
      return
    }

    if (reportItem) {
      goToSearch(reportItem.href)
      return
    }

    goToSearch(`/karyawan?search=${encodeURIComponent(normalizedSearch)}`)
  }

  return (
    <>
      <header
        className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/70 grid grid-cols-[auto_1fr_auto] items-center gap-4 px-4 sm:px-6 sticky top-0 z-30"
        style={{ boxShadow: '0 1px 0 rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.04)' }}
      >
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileOpen(prev => !prev)}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop expand button (only when sidebar is collapsed) */}
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="hidden lg:flex p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all duration-150"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          <div className="hidden min-w-[170px] sm:block">
            <p className="truncate text-sm font-bold text-slate-900 leading-none">
              {dayName}, <span className="font-medium text-slate-500">{dateStr}</span>
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative hidden justify-center md:flex" ref={searchRef}>
          <form onSubmit={submitSearch} className="w-full max-w-[620px]">
            <div className="flex h-10 items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 text-sm text-slate-500 transition focus-within:border-primary-300 focus-within:bg-white focus-within:shadow-sm">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Cari karyawan, aset, kendaraan, laporan..."
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:ring-0"
              />
              <span className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-500">Ctrl + K</span>
            </div>
          </form>

          {searchOpen && (
            <div className="absolute left-1/2 top-full z-50 mt-2 w-full max-w-[620px] -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">
                  {normalizedSearch ? `Hasil pencarian untuk "${normalizedSearch}"` : 'Ketik minimal 2 karakter untuk mencari'}
                </p>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-2">
                {normalizedSearch.length < 2 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Karyawan', href: '/karyawan', icon: UsersRound },
                      { label: 'Aset', href: '/aset', icon: PackageCheck },
                      { label: 'Kendaraan', href: '/kendaraan', icon: CarFront },
                      { label: 'Laporan', href: '/laporan', icon: FileText },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => goToSearch(item.href)}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <item.icon className="h-4 w-4 text-primary-600" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : searchLoading ? (
                  <div className="space-y-2 p-2">
                    {[0, 1, 2].map((item) => (
                      <div key={item} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : hasSearchResults ? (
                  <div className="space-y-3">
                    {searchGroups.map((group) => {
                      const items = searchResults[group.key] || []
                      if (!items.length) return null
                      return (
                        <div key={group.key}>
                          <div className="mb-1 flex items-center justify-between px-2">
                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{group.label}</p>
                            <button
                              onClick={() => goToSearch(`${group.href}?search=${encodeURIComponent(normalizedSearch)}`)}
                              className="text-[11px] font-semibold text-primary-600 hover:text-primary-700"
                            >
                              Lihat semua
                            </button>
                          </div>
                          <div className="space-y-1">
                            {items.map((item) => {
                              const title = group.getTitle(item)
                              const subtitle = group.getSubtitle(item)
                              return (
                                <button
                                  key={item._id || item.id || `${group.key}-${title}`}
                                  onClick={() => goToSearch(group.getHref(item, normalizedSearch))}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50"
                                >
                                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${group.iconClass}`}>
                                    <group.icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-slate-800">{title || '-'}</span>
                                    <span className="block truncate text-xs text-slate-500">{subtitle || group.label}</span>
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}

                    {!!searchResults.laporan?.length && (
                      <div>
                        <p className="mb-1 px-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Laporan</p>
                        <div className="space-y-1">
                          {searchResults.laporan.map((item) => (
                            <button key={item.title} onClick={() => goToSearch(item.href)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                                <item.icon className="h-4 w-4" />
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold text-slate-800">{item.title}</span>
                                <span className="block truncate text-xs text-slate-500">{item.subtitle}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                    Tidak ada hasil. Tekan Enter untuk mencari di data karyawan.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end gap-1">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotif(!showNotif); setShowUser(false) }}
              className={cn(
                'relative p-2 rounded-xl transition-all duration-150',
                showNotif
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <BellDot className={cn(
                'w-[18px] h-[18px]',
                unreadCount > 0 ? 'animate-bell-ring' : ''
              )} />
              {unreadCount > 0 && (
                <span className="notif-badge-pop absolute top-1 right-1 min-w-[16px] h-4 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none px-0.5 shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div
                className="dropdown-appear absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-1rem)] bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    <BellDot className="w-4 h-4 text-primary-600" />
                    <h3 className="font-semibold text-gray-800 text-sm">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} baru
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => {
                        fetch('/api/notifikasi/read-all', { method: 'PATCH' })
                          .then(() => queryClient.invalidateQueries({ queryKey: ['notifications-header'] }))
                      }}
                      className="text-[11px] text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3" />
                      Baca semua
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-2">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                        <BellDot className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-gray-400 text-sm">Tidak ada notifikasi</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id || notif.id}
                        onClick={() => markAsRead(notif._id || notif.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 transition-all duration-150 hover:bg-gray-50/80',
                          notif.status === 'BELUM_DIBACA' && 'bg-blue-50/30'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('w-2 h-2 rounded-full mt-2 shrink-0 animate-dot-pulse', notifDot(notif.tipe))} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={cn('text-[9px] px-1.5 py-0.5 rounded border font-bold tracking-wider shrink-0', notifColor(notif.tipe))}>
                                {notif.tipe}
                              </span>
                              <p className="text-xs text-gray-400">{formatDate(notif.createdAt)}</p>
                            </div>
                            <p className="text-sm font-medium text-gray-800 leading-snug">{notif.judul}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.pesan}</p>
                          </div>
                          {notif.status === 'BELUM_DIBACA' && (
                            <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 shrink-0 animate-dot-pulse" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="px-4 py-3 border-t border-gray-50 bg-gray-50/50">
                  <Link
                    href="/notifikasi"
                    onClick={() => setShowNotif(false)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 group"
                  >
                    Lihat semua notifikasi
                    <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button className="hidden p-2 rounded-xl text-slate-500 transition-all duration-150 hover:bg-slate-100 hover:text-slate-700 sm:flex" aria-label="Pesan">
            <MessageSquareText className="w-[18px] h-[18px]" />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotif(false) }}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-150',
                showUser ? 'bg-primary-50' : 'hover:bg-gray-100'
              )}
            >
              <div className="relative">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)' }}
                >
                  {initials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-none">{userName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{session?.user?.role}</p>
              </div>
              <ChevronDown className={cn(
                'w-3.5 h-3.5 text-gray-400 transition-transform duration-200',
                showUser ? 'rotate-180' : ''
              )} />
            </button>

            {showUser && (
              <div
                className="dropdown-appear absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 z-50 overflow-hidden"
                style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06)' }}
              >
                <div className="px-4 py-4 border-b border-gray-50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-blue-50/60 to-violet-50/40" />
                  <div className="relative">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #6d28d9 100%)' }}
                      >
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{session?.user?.email}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide bg-primary-100 text-primary-700">
                      <Sparkles className="w-2.5 h-2.5" />
                      {session?.user?.role}
                    </span>
                  </div>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-150 font-medium group"
                  >
                    <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop for dropdowns */}
      {(showNotif || showUser) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setShowNotif(false); setShowUser(false) }}
        />
      )}
    </>
  )
}
