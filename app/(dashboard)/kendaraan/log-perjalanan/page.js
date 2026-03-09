'use client'

import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import DataTable from '@/components/ui/DataTable'
import LogModal from '@/components/kendaraan/LogModal'
import { formatDate, formatNumber } from '@/lib/utils'

export default function LogPerjalananPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)

  const { data: result, isLoading } = useQuery({
    queryKey: ['log-perjalanan', page],
    queryFn: () => fetch(`/api/kendaraan/log-perjalanan?page=${page}&limit=10`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1
  const totalKm = rows.reduce((sum, d) => sum + (d.totalKm || 0), 0)

  const columns = useMemo(() => [
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ getValue }) => formatDate(getValue(), 'dd/MM/yyyy'),
    },
    {
      id: 'kendaraan',
      header: 'Kendaraan',
      cell: ({ row }) => (
        <div>
          <p className="font-mono font-bold text-sm">{row.original.kendaraan?.noPol}</p>
          <p className="text-xs text-gray-400">{row.original.kendaraan?.merk}</p>
        </div>
      ),
    },
    {
      id: 'pengemudi',
      header: 'Pengemudi',
      cell: ({ row }) => row.original.karyawan?.nama || row.original.keperluan || '-',
    },
    {
      accessorKey: 'tujuan',
      header: 'Tujuan',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'kmAwal',
      header: 'KM Awal',
      cell: ({ getValue }) => getValue() ? formatNumber(getValue()) : '-',
    },
    {
      accessorKey: 'kmAkhir',
      header: 'KM Akhir',
      cell: ({ getValue }) => getValue() ? formatNumber(getValue()) : '-',
    },
    {
      accessorKey: 'totalKm',
      header: 'Total KM',
      cell: ({ getValue }) => <span className="font-semibold">{getValue() ? formatNumber(getValue()) : '-'}</span>,
    },
    {
      accessorKey: 'bbm',
      header: 'BBM (L)',
      cell: ({ getValue }) => getValue() || '-',
    },
  ], [])

  return (
    <div>
      <PageHeader
        title="Log Perjalanan Dinas"
        subtitle={`${total} record perjalanan`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Log Perjalanan' }]}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Log
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Perjalanan (halaman ini)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{rows.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total KM (halaman ini)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalKm)} km</p>
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Belum ada log perjalanan" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} perjalanan</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <LogModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); queryClient.invalidateQueries({ queryKey: ['log-perjalanan'] }) }} />
    </div>
  )
}
