'use client'

import { useState, useMemo } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import DataTable from '@/components/ui/DataTable'
import { ConfirmModal } from '@/components/ui/Modal'
import PeminjamanModal from '@/components/aset/PeminjamanModal'
import { formatDate } from '@/lib/utils'

export default function PeminjamanAsetPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('DIPINJAM')
  const [showModal, setShowModal] = useState(false)
  const [returnId, setReturnId] = useState(null)

  const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })

  const { data: result, isLoading } = useQuery({
    queryKey: ['peminjaman', page, statusFilter],
    queryFn: () => fetch(`/api/aset/peminjaman?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const returnMutation = useMutation({
    mutationFn: (id) => fetch('/api/aset/peminjaman', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Aset berhasil dikembalikan')
      queryClient.invalidateQueries({ queryKey: ['peminjaman'] })
      setReturnId(null)
    },
    onError: () => toast.error('Gagal proses pengembalian'),
  })

  const columns = useMemo(() => [
    {
      id: 'aset',
      header: 'Aset',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.aset?.namaAset}</p>
          <p className="text-xs text-gray-400">{row.original.aset?.kodeAset}</p>
        </div>
      ),
    },
    {
      id: 'karyawan',
      header: 'Karyawan',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.karyawan?.nama}</p>
          <p className="text-xs text-gray-400">{row.original.karyawan?.jabatan}</p>
        </div>
      ),
    },
    {
      accessorKey: 'keperluan',
      header: 'Keperluan',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'tanggalPinjam',
      header: 'Tgl Pinjam',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'tanggalRencanaKembali',
      header: 'Rencana Kembali',
      cell: ({ getValue, row }) => {
        const val = getValue()
        if (!val) return '-'
        const isOverdue = new Date(val) < new Date() && row.original.status === 'DIPINJAM'
        return <span className={isOverdue ? 'text-red-600 font-medium' : ''}>{formatDate(val)}</span>
      },
    },
    {
      accessorKey: 'tanggalKembali',
      header: 'Tgl Kembali',
      cell: ({ getValue }) => getValue() ? formatDate(getValue()) : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      id: 'aksi',
      header: 'Aksi',
      cell: ({ row }) => row.original.status === 'DIPINJAM' ? (
        <button onClick={() => setReturnId(row.original.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Kembalikan">
          <RotateCcw className="w-4 h-4" />
        </button>
      ) : null,
    },
  ], [])

  return (
    <div>
      <PageHeader
        title="Peminjaman Aset"
        subtitle={`${total} record peminjaman`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Aset', href: '/aset' }, { label: 'Peminjaman' }]}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Buat Peminjaman
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <select className="form-select w-48" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option value="DIPINJAM">Dipinjam</option>
          <option value="DIKEMBALIKAN">Dikembalikan</option>
        </select>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada data peminjaman" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} peminjaman</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <PeminjamanModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); queryClient.invalidateQueries({ queryKey: ['peminjaman'] }) }} />
      <ConfirmModal isOpen={!!returnId} onClose={() => setReturnId(null)} onConfirm={() => returnMutation.mutate(returnId)} title="Konfirmasi Pengembalian" message="Konfirmasi bahwa aset telah dikembalikan?" />
    </div>
  )
}
