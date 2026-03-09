'use client'

import { useState } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const TIPE_COLORS = {
  KONTRAK: 'bg-blue-100 text-blue-700 border-blue-200',
  ULANG_TAHUN: 'bg-pink-100 text-pink-700 border-pink-200',
  SERVIS: 'bg-amber-100 text-amber-700 border-amber-200',
  PAJAK: 'bg-red-100 text-red-700 border-red-200',
  INFO: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function NotifikasiPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data: result, isLoading } = useQuery({
    queryKey: ['notifikasi-page', page],
    queryFn: () => fetch(`/api/notifikasi?page=${page}&limit=20`).then(r => r.json()),
    keepPreviousData: true,
  })

  const notifications = result?.data || []
  const unreadCount = result?.unreadCount || 0
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const refetch = () => queryClient.invalidateQueries({ queryKey: ['notifikasi-page'] })

  const markAsRead = async (id) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
    refetch()
    queryClient.invalidateQueries({ queryKey: ['notifications-header'] })
  }

  const deleteNotif = async (id) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'DELETE' })
    toast.success('Notifikasi dihapus')
    refetch()
    queryClient.invalidateQueries({ queryKey: ['notifications-header'] })
  }

  const markAllRead = async () => {
    await fetch('/api/notifikasi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAllRead: true }),
    })
    toast.success('Semua notifikasi ditandai dibaca')
    refetch()
    queryClient.invalidateQueries({ queryKey: ['notifications-header'] })
  }

  if (isLoading) return <PageLoader />

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        subtitle={`${unreadCount} belum dibaca dari ${total} total`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Notifikasi' }]}
        actions={
          unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary">
              <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
            </button>
          )
        }
      />

      <div className="page-section">
        {notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState icon={Bell} title="Tidak ada notifikasi" description="Semua notifikasi sudah dibaca" />
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {notifications.map((notif) => {
                const id = notif._id || notif.id
                return (
                  <div
                    key={id}
                    className={cn(
                      'p-4 flex items-start gap-4 transition-colors',
                      notif.status === 'BELUM_DIBACA' ? 'bg-blue-50/40' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={cn('shrink-0 px-2 py-0.5 text-[10px] font-bold rounded border tracking-wide', TIPE_COLORS[notif.tipe] || TIPE_COLORS.INFO)}>
                      {notif.tipe}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={cn('text-sm font-semibold', notif.status === 'BELUM_DIBACA' ? 'text-gray-900' : 'text-gray-600')}>
                            {notif.judul}
                          </p>
                          {notif.pesan && <p className="text-sm text-gray-500 mt-0.5 leading-snug">{notif.pesan}</p>}
                          <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt, 'dd MMM yyyy HH:mm')}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {notif.status === 'BELUM_DIBACA' && (
                            <button onClick={() => markAsRead(id)}
                              className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors" title="Tandai dibaca">
                              <CheckCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => deleteNotif(id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    {notif.status === 'BELUM_DIBACA' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    )}
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-center">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
