'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'

const TIPE_COLORS = {
  KONTRAK: 'bg-blue-100 text-blue-700 border-blue-200',
  ULANG_TAHUN: 'bg-pink-100 text-pink-700 border-pink-200',
  SERVIS: 'bg-orange-100 text-orange-700 border-orange-200',
  PAJAK: 'bg-red-100 text-red-700 border-red-200',
  INFO: 'bg-gray-100 text-gray-700 border-gray-200',
}

export default function NotifikasiPage() {
  const [data, setData] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/notifikasi?page=${page}&limit=20`)
      const json = await res.json()
      setData(json.data || [])
      setUnreadCount(json.unreadCount || 0)
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const markAsRead = async (id) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'PATCH' })
    fetchData()
  }

  const deleteNotif = async (id) => {
    await fetch(`/api/notifikasi/${id}`, { method: 'DELETE' })
    toast.success('Notifikasi dihapus')
    fetchData()
  }

  const markAllRead = async () => {
    await fetch('/api/notifikasi', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markAllRead: true }) })
    toast.success('Semua notifikasi ditandai dibaca')
    fetchData()
  }

  return (
    <div>
      <PageHeader
        title="Notifikasi"
        subtitle={`${unreadCount} notifikasi belum dibaca dari ${total} total`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Notifikasi' }]}
        actions={
          unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary">
              <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
            </button>
          )
        }
      />

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? (
          <EmptyState icon={Bell} title="Tidak ada notifikasi" description="Semua notifikasi sudah dibaca" />
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {data.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start gap-4 transition-colors ${notif.status === 'BELUM_DIBACA' ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}
                >
                  <div className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded border ${TIPE_COLORS[notif.tipe] || TIPE_COLORS.INFO}`}>
                    {notif.tipe}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${notif.status === 'BELUM_DIBACA' ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notif.judul}
                        </p>
                        {notif.pesan && <p className="text-sm text-gray-500 mt-0.5">{notif.pesan}</p>}
                        <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt, 'dd MMM yyyy HH:mm')}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {notif.status === 'BELUM_DIBACA' && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="p-1.5 rounded hover:bg-blue-100 text-blue-600 text-xs"
                            title="Tandai dibaca"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotif(notif.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-400"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {notif.status === 'BELUM_DIBACA' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  )}
                </div>
              ))}
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
