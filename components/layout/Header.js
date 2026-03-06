'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Search, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { formatDate } from '@/lib/utils'

export default function Header() {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotif, setShowNotif] = useState(false)
  const [showUser, setShowUser] = useState(false)

  useEffect(() => {
    fetchNotifications()
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifikasi?limit=5')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.data || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch {}
  }

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
      fetchNotifications()
    } catch {}
  }

  const notifIconColor = (tipe) => {
    const colors = {
      KONTRAK: 'text-blue-500 bg-blue-50',
      ULANG_TAHUN: 'text-pink-500 bg-pink-50',
      SERVIS: 'text-orange-500 bg-orange-50',
      PAJAK: 'text-red-500 bg-red-50',
    }
    return colors[tipe] || 'text-gray-500 bg-gray-50'
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left - Breadcrumb / Title */}
      <div className="flex items-center gap-4">
        <p className="text-sm text-gray-500">
          {formatDate(new Date(), 'EEEE, dd MMMM yyyy')}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(!showNotif); setShowUser(false) }}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-8">Tidak ada notifikasi</p>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                        notif.status === 'BELUM_DIBACA' ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${notifIconColor(notif.tipe)}`}>
                          {notif.tipe}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 leading-tight">{notif.judul}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.pesan}</p>
                          <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                        </div>
                        {notif.status === 'BELUM_DIBACA' && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />
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
                  className="text-xs text-primary-600 hover:underline font-medium"
                >
                  Lihat semua notifikasi
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUser(!showUser); setShowNotif(false) }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-700 leading-none">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {showUser && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">{session?.user?.name}</p>
                <p className="text-xs text-gray-500">{session?.user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(showNotif || showUser) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowNotif(false); setShowUser(false) }}
        />
      )}
    </header>
  )
}
