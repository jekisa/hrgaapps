'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Activity } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'

const MODULS = ['AUTH', 'KARYAWAN', 'ASET', 'PEMINJAMAN_ASET', 'MAINTENANCE', 'UTILITAS', 'KENDARAAN', 'JADWAL_KENDARAAN', 'LOG_PERJALANAN', 'PERAWATAN_KENDARAAN', 'PAJAK_KENDARAAN']

const AKSI_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-700',
}

export default function AuditTrailPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modulFilter, setModulFilter] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit: 20,
        ...(search && { search }),
        ...(modulFilter && { modul: modulFilter }),
      })
      const res = await fetch(`/api/audit-trail?${params}`)
      if (res.status === 403) {
        setData([])
        setLoading(false)
        return
      }
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, search, modulFilter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      <PageHeader
        title="Audit Trail"
        subtitle={`${total} aktivitas tercatat`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Audit Trail' }]}
      />

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari nama pengguna atau detail..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select w-full sm:w-56" value={modulFilter} onChange={(e) => { setModulFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Modul</option>
            {MODULS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? (
          <EmptyState icon={Activity} title="Tidak ada log aktivitas" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Waktu</th>
                    <th className="table-th">Pengguna</th>
                    <th className="table-th">Aksi</th>
                    <th className="table-th">Modul</th>
                    <th className="table-th">Detail</th>
                    <th className="table-th">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="table-td text-xs">{formatDate(log.createdAt, 'dd/MM/yyyy HH:mm:ss')}</td>
                      <td className="table-td">
                        <p className="font-medium text-sm">{log.user?.name || 'System'}</p>
                        <p className="text-xs text-gray-400">{log.user?.email}</p>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${AKSI_COLORS[log.aksi] || 'bg-gray-100 text-gray-700'}`}>
                          {log.aksi}
                        </span>
                      </td>
                      <td className="table-td">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{log.modul}</span>
                      </td>
                      <td className="table-td max-w-xs">
                        <p className="text-sm text-gray-600 truncate">{log.detail || '-'}</p>
                      </td>
                      <td className="table-td font-mono text-xs text-gray-400">{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} log</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
