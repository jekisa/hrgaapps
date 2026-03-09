'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/Modal'
import DataTable from '@/components/ui/DataTable'
import { formatDate, getDaysDiff } from '@/lib/utils'
import KendaraanModal from '@/components/kendaraan/KendaraanModal'

export default function KendaraanPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({
    page, limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['kendaraan', page, search, statusFilter],
    queryFn: () => fetch(`/api/kendaraan?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/kendaraan/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Kendaraan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['kendaraan'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus kendaraan'),
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const columns = useMemo(() => [
    {
      accessorKey: 'noPol',
      header: 'No Polisi',
      cell: ({ getValue }) => <span className="font-mono font-bold text-sm">{getValue()}</span>,
    },
    {
      id: 'kendaraan',
      header: 'Kendaraan',
      enableSorting: true,
      accessorKey: 'merk',
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.merk} {row.original.model}</p>
          <p className="text-xs text-gray-400">{row.original.jenisKendaraan} • {row.original.warna || '-'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'tahun',
      header: 'Tahun',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'tanggalPajakBerakhir',
      header: 'Pajak Berakhir',
      cell: ({ getValue }) => {
        const val = getValue()
        if (!val) return '-'
        const diff = getDaysDiff(val)
        const soon = diff !== null && diff <= 30
        return (
          <span className={soon ? 'text-red-600 font-semibold' : ''}>
            {formatDate(val, 'dd/MM/yyyy')}
            {soon && diff >= 0 && <span className="text-xs ml-1">({diff}h)</span>}
          </span>
        )
      },
    },
    {
      accessorKey: 'tanggalSTNKBerakhir',
      header: 'STNK Berakhir',
      cell: ({ getValue }) => getValue() ? formatDate(getValue(), 'dd/MM/yyyy') : '-',
    },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setEditData(row.original); setShowModal(true) }}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.original._id || row.original.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [])

  return (
    <div>
      <PageHeader
        title="Manajemen Kendaraan"
        subtitle={`${total} kendaraan terdaftar`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Kendaraan
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari no polisi atau merk..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select w-full sm:w-44" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Status</option>
            <option value="TERSEDIA">Tersedia</option>
            <option value="DIGUNAKAN">Digunakan</option>
            <option value="SERVIS">Servis</option>
            <option value="TIDAK_AKTIF">Tidak Aktif</option>
          </select>
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Belum ada data kendaraan" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} kendaraan</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <KendaraanModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={() => { setShowModal(false); setEditData(null); queryClient.invalidateQueries({ queryKey: ['kendaraan'] }) }}
        editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Hapus Kendaraan" />
    </div>
  )
}
