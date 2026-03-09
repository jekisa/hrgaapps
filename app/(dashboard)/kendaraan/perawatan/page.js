'use client'

import { useState, useMemo } from 'react'
import { Plus, Edit } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import DataTable from '@/components/ui/DataTable'
import PerawatanModal from '@/components/kendaraan/PerawatanModal'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'

export default function PerawatanPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })

  const { data: result, isLoading } = useQuery({
    queryKey: ['perawatan-kendaraan', page, statusFilter],
    queryFn: () => fetch(`/api/kendaraan/perawatan?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const columns = useMemo(() => [
    {
      id: 'kendaraan',
      header: 'Kendaraan',
      cell: ({ row }) => (
        <div>
          <p className="font-mono font-bold text-sm">{row.original.kendaraan?.noPol}</p>
          <p className="text-xs text-gray-400">{row.original.kendaraan?.merk} {row.original.kendaraan?.model}</p>
        </div>
      ),
    },
    {
      accessorKey: 'jenisPerawatan',
      header: 'Jenis',
      cell: ({ getValue }) => getValue()?.replace('_', ' ') || '-',
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'bengkel',
      header: 'Bengkel',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'kmServis',
      header: 'KM Servis',
      cell: ({ getValue }) => getValue() ? `${formatNumber(getValue())} km` : '-',
    },
    {
      accessorKey: 'kmServisBerikutnya',
      header: 'KM Berikutnya',
      cell: ({ getValue }) => getValue() ? `${formatNumber(getValue())} km` : '-',
    },
    {
      accessorKey: 'biaya',
      header: 'Biaya',
      cell: ({ getValue }) => formatCurrency(getValue()),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => (
        <button onClick={() => { setEditData(row.original); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ], [])

  const handleSaved = () => {
    setShowModal(false)
    setEditData(null)
    queryClient.invalidateQueries({ queryKey: ['perawatan-kendaraan'] })
  }

  return (
    <div>
      <PageHeader
        title="Perawatan & Servis Kendaraan"
        subtitle="Jadwal dan riwayat perawatan kendaraan"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Perawatan' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          {['', 'TERJADWAL', 'SELESAI'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada data perawatan" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} data</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <PerawatanModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={handleSaved} editData={editData} />
    </div>
  )
}
