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
import { formatDate, formatCurrency } from '@/lib/utils'
import MaintenanceModal from '@/components/gedung/MaintenanceModal'

const PRIORITAS = ['LOW', 'NORMAL', 'HIGH', 'URGENT']

export default function MaintenancePage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [prioritasFilter, setPrioritasFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({
    page, limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(prioritasFilter && { prioritas: prioritasFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['maintenance', page, search, statusFilter, prioritasFilter],
    queryFn: () => fetch(`/api/gedung/maintenance?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/gedung/maintenance/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Request berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      setDeleteId(null)
    },
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const summary = { PENDING: 0, PROSES: 0, SELESAI: 0, DITOLAK: 0 }
  rows.forEach((d) => { if (summary[d.status] !== undefined) summary[d.status]++ })

  const columns = useMemo(() => [
    {
      accessorKey: 'judul',
      header: 'Judul',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-gray-900">{row.original.judul}</p>
          {row.original.deskripsi && (
            <p className="text-xs text-gray-400 truncate max-w-48 mt-0.5">{row.original.deskripsi}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'lokasi',
      header: 'Lokasi',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'prioritas',
      header: 'Prioritas',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'pemohon',
      header: 'Pemohon',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'tanggalRequest',
      header: 'Tgl Request',
      cell: ({ getValue }) => formatDate(getValue()),
    },
    {
      accessorKey: 'biaya',
      header: 'Biaya',
      cell: ({ getValue }) => getValue() ? formatCurrency(getValue()) : '-',
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
        title="Maintenance Request"
        subtitle="Kelola permintaan pemeliharaan gedung dan fasilitas"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Gedung & Fasilitas' }, { label: 'Maintenance' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Buat Request
          </button>
        }
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Pending', status: 'PENDING', cls: 'border-amber-200 bg-amber-50 text-amber-700' },
          { label: 'Proses', status: 'PROSES', cls: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Selesai', status: 'SELESAI', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
          { label: 'Ditolak', status: 'DITOLAK', cls: 'border-red-200 bg-red-50 text-red-700' },
        ].map((item) => (
          <button key={item.status}
            onClick={() => setStatusFilter(statusFilter === item.status ? '' : item.status)}
            className={`rounded-xl p-3.5 border text-left transition-all ${item.cls} ${statusFilter === item.status ? 'ring-2 ring-offset-1 ring-current' : 'hover:opacity-90'}`}
          >
            <p className="text-2xl font-bold">{summary[item.status]}</p>
            <p className="text-xs font-medium mt-0.5">{item.label}</p>
          </button>
        ))}
      </div>

      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari judul atau lokasi..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <select className="form-select w-full sm:w-40" value={prioritasFilter} onChange={(e) => { setPrioritasFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Prioritas</option>
            {PRIORITAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="page-section">
        <DataTable data={rows} columns={columns} isLoading={isLoading} emptyMessage="Tidak ada maintenance request" />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">Total {total} request</p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <MaintenanceModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={() => { setShowModal(false); setEditData(null); queryClient.invalidateQueries({ queryKey: ['maintenance'] }) }}
        editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)} loading={deleteMutation.isPending} title="Hapus Request" />
    </div>
  )
}
