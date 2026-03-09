'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, LogOut, PanelLeftOpen } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const notifColor = (tipe) => {
  const map = {
    KONTRAK: 'text-blue-600 bg-blue-50 border-blue-100',
    ULANG_TAHUN: 'text-pink-600 bg-pink-50 border-pink-100',
    SERVIS: 'text-orange-600 bg-orange-50 border-orange-100',
    PAJAK: 'text-red-600 bg-red-50 border-red-100',
  }
  return map[tipe] || 'text-gray-600 bg-gray-50 border-gray-100'
}

export default function Header({ collapsed, setCollapsed }) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)

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

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm">
        {/* Left */}
        <div className="flex items-center gap-3">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <p className="text-sm text-gray-500 hidden sm:block font-medium">
            {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => { setShowNotif(!showNotif); setShowUser(false) }}
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card-lg border border-gray-100 z-50 animate-slide-up">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">Notifikasi</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-gray-400 text-sm py-10">Tidak ada notifikasi</p>
                  ) : (
                    notifications.map((notif) => (
                      <button
                        key={notif._id || notif.id}
                        onClick={() => markAsRead(notif._id || notif.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50',
                          notif.status === 'BELUM_DIBACA' && 'bg-blue-50/30'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <span className={cn('text-[10px] px-1.5 py-0.5 rounded border font-semibold tracking-wide shrink-0 mt-0.5', notifColor(notif.tipe))}>
                            {notif.tipe}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 leading-snug">{notif.judul}</p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notif.pesan}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                          </div>
                          {notif.status === 'BELUM_DIBACA' && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-100">
                  <Link
                    href="/notifikasi"
                    onClick={() => setShowNotif(false)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Lihat semua notifikasi →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => { setShowUser(!showUser); setShowNotif(false) }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-700 leading-none">{userName}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{session?.user?.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {showUser && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-card-lg border border-gray-100 z-50 animate-slide-up overflow-hidden">
                <div className="px-4 py-3 bg-gradient-to-br from-primary-50 to-blue-50 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">{userName}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{session?.user?.email}</p>
                  <span className="mt-1.5 inline-block text-[10px] px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-semibold">
                    {session?.user?.role}
                  </span>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {(showNotif || showUser) && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => { setShowNotif(false); setShowUser(false) }}
        />
      )}
    </>
  )
}
