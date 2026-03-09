'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import DataTable from '@/components/ui/DataTable'
import { formatDate } from '@/lib/utils'

const MODULS = ['AUTH', 'KARYAWAN', 'ASET', 'PEMINJAMAN_ASET', 'MAINTENANCE', 'UTILITAS', 'KENDARAAN', 'JADWAL_KENDARAAN', 'LOG_PERJALANAN', 'PERAWATAN_KENDARAAN', 'PAJAK_KENDARAAN']

const AKSI_COLORS = {
  CREATE: 'bg-emerald-100 text-emerald-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-violet-100 text-violet-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
}

export default function AuditTrailPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modulFilter, setModulFilter] = useState('')

  const params = new URLSearchParams({
    page, limit: 20,
    ...(search && { search }),
    ...(modulFilter && { modul: modulFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['audit-trail', page, search, modulFilter],
    queryFn: () => fetch(`/api/audit-trail?${params}`).then(r => r.ok ? r.json() : { data: [], total: 0, totalPages: 1 }),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const columns = useMemo(() => [
    {
      accessorKey: 'createdAt',
      header: 'Waktu',
      cell: ({ getValue }) => (
        <span className="text-xs font-mono text-gray-500">{formatDate(getValue(), 'dd/MM/yyyy HH:mm:ss')}</span>
      ),
    },
    {
      id: 'pengguna',
      header: 'Pengguna',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-sm text-gray-900">{row.original.user?.name || 'System'}</p>
          <p className="text-xs text-gray-400">{row.original.user?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: 'aksi',
      header: 'Aksi',
      cell: ({ getValue }) => (
        <span className={`badge ${AKSI_COLORS[getValue()] || 'bg-gray-100 text-gray-700'}`}>
          {getValue()}
        </span>
      ),
    },
    {
      accessorKey: 'modul',
      header: 'Modul',
      cell: ({ getValue }) => (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'detail',
      header: 'Detail',
      cell: ({ getValue }) => (
        <p className="text-sm text-gray-600 truncate max-w-xs">{getValue() || '-'}</p>
      ),
    },
    {
      accessorKey: 'ipAddress',
      header: 'IP Address',
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-gray-400">{getValue() || '-'}</span>
      ),
    },
  ], [])

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
            <input className="form-input pl-9" placeholder="Cari nama pengguna atau detail..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select w-full sm:w-56" value={modulFilter} onChange={(e) => { setModulFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Modul</option>
            {MODULS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada log aktivitas" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} log</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
