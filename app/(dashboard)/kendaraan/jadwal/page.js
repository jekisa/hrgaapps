'use client'

import { useState, useMemo } from 'react'
import { Plus, Calendar, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import DataTable from '@/components/ui/DataTable'
import JadwalModal from '@/components/kendaraan/JadwalModal'
import { formatDate } from '@/lib/utils'

export default function JadwalKendaraanPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })

  const { data: result, isLoading } = useQuery({
    queryKey: ['jadwal-kendaraan', page, statusFilter],
    queryFn: () => fetch(`/api/kendaraan/jadwal?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => fetch('/api/kendaraan/jadwal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Status diperbarui')
      queryClient.invalidateQueries({ queryKey: ['jadwal-kendaraan'] })
    },
    onError: () => toast.error('Gagal update status'),
  })

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
      accessorKey: 'pengemudi',
      header: 'Pengemudi',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      id: 'tujuan',
      header: 'Tujuan / Keperluan',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.tujuan || '-'}</p>
          <p className="text-xs text-gray-400">{row.original.keperluan || '-'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'tanggalBerangkat',
      header: 'Berangkat',
      cell: ({ getValue }) => formatDate(getValue(), 'dd/MM/yyyy HH:mm'),
    },
    {
      accessorKey: 'tanggalKembali',
      header: 'Kembali',
      cell: ({ getValue }) => getValue() ? formatDate(getValue(), 'dd/MM/yyyy HH:mm') : '-',
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
        <div className="flex items-center gap-1">
          {row.original.status === 'TERJADWAL' && (
            <>
              <button onClick={() => updateMutation.mutate({ id: row.original.id, status: 'BERLANGSUNG' })} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Mulai">
                <Calendar className="w-4 h-4" />
              </button>
              <button onClick={() => updateMutation.mutate({ id: row.original.id, status: 'DIBATALKAN' })} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Batalkan">
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {row.original.status === 'BERLANGSUNG' && (
            <button onClick={() => updateMutation.mutate({ id: row.original.id, status: 'SELESAI' })} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Selesaikan">
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ], [updateMutation])

  return (
    <div>
      <PageHeader
        title="Jadwal Pemakaian Kendaraan"
        subtitle={`${total} jadwal tercatat`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Jadwal' }]}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Buat Jadwal
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'TERJADWAL', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN'].map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada jadwal kendaraan" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} jadwal</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <JadwalModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); queryClient.invalidateQueries({ queryKey: ['jadwal-kendaraan'] }) }} />
    </div>
  )
}
