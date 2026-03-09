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
import { formatCurrency } from '@/lib/utils'
import AsetModal from '@/components/aset/AsetModal'

const KATEGORI = ['ELEKTRONIK', 'PERALATAN', 'KENDARAAN', 'FURNITURE', 'LAINNYA']
const STATUS = ['AKTIF', 'DIPINJAM', 'RUSAK', 'DISPOSAL']

export default function AsetPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({
    page, limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(kategoriFilter && { kategori: kategoriFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['aset', page, search, statusFilter, kategoriFilter],
    queryFn: () => fetch(`/api/aset?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/aset/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Aset berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['aset'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus aset'),
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const columns = useMemo(() => [
    {
      accessorKey: 'kodeAset',
      header: 'Kode',
      cell: ({ getValue }) => <span className="font-mono text-xs text-gray-600">{getValue()}</span>,
    },
    {
      accessorKey: 'namaAset',
      header: 'Nama Aset',
      enableSorting: true,
      cell: ({ getValue }) => <span className="font-semibold text-gray-900">{getValue()}</span>,
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ getValue }) => (
        <span className="badge bg-gray-100 text-gray-700 border border-gray-200">{getValue()}</span>
      ),
    },
    {
      id: 'merkModel',
      header: 'Merk / Model',
      cell: ({ row }) => [row.original.merk, row.original.model].filter(Boolean).join(' / ') || '-',
    },
    {
      accessorKey: 'kondisi',
      header: 'Kondisi',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'nilaiPerolehan',
      header: 'Nilai',
      cell: ({ getValue }) => formatCurrency(getValue()),
    },
    {
      accessorKey: 'lokasi',
      header: 'Lokasi',
      cell: ({ getValue }) => getValue() || '-',
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
        title="Inventaris Aset"
        subtitle={`Total ${total} aset terdaftar`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Aset' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Aset
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari nama atau kode aset..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select w-full sm:w-40" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Status</option>
            {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select w-full sm:w-44" value={kategoriFilter} onChange={(e) => { setKategoriFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Kategori</option>
            {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Belum ada data aset" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} aset</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <AsetModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={() => { setShowModal(false); setEditData(null); queryClient.invalidateQueries({ queryKey: ['aset'] }) }}
        editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Hapus Aset" />
    </div>
  )
}
