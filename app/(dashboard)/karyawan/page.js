'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, Edit, Trash2, Users, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { ConfirmModal } from '@/components/ui/Modal'
import DataTable from '@/components/ui/DataTable'
import { formatDate, DEPARTEMEN_LIST } from '@/lib/utils'
import KaryawanModal from '@/components/karyawan/KaryawanModal'

export default function KaryawanPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const params = new URLSearchParams({
    page, limit: 10,
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(deptFilter && { departemen: deptFilter }),
  })

  const { data: result, isLoading } = useQuery({
    queryKey: ['karyawan', page, search, statusFilter, deptFilter],
    queryFn: () => fetch(`/api/karyawan?${params}`).then(r => r.json()),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => fetch(`/api/karyawan/${id}`, { method: 'DELETE' }).then(r => r.json()),
    onSuccess: () => {
      toast.success('Karyawan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['karyawan'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Gagal menghapus karyawan'),
  })

  const rows = result?.data || []
  const total = result?.total || 0
  const totalPages = result?.totalPages || 1

  const columns = useMemo(() => [
    {
      accessorKey: 'nik',
      header: 'NIK',
      cell: ({ getValue }) => <span className="font-mono text-xs text-gray-600">{getValue()}</span>,
    },
    {
      accessorKey: 'nama',
      header: 'Nama',
      enableSorting: true,
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-gray-900">{row.original.nama}</div>
          <div className="text-xs text-gray-400 mt-0.5">{row.original.email || row.original.telepon || '-'}</div>
        </div>
      ),
    },
    {
      accessorKey: 'jabatan',
      header: 'Jabatan',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'departemen',
      header: 'Departemen',
      cell: ({ getValue }) => getValue() || '-',
    },
    {
      accessorKey: 'statusKontrak',
      header: 'Status',
      cell: ({ getValue }) => <Badge status={getValue()} />,
    },
    {
      accessorKey: 'tanggalMasuk',
      header: 'Tgl Masuk',
      cell: ({ getValue }) => formatDate(getValue(), 'dd/MM/yyyy'),
    },
    {
      accessorKey: 'tanggalKontrakBerakhir',
      header: 'Kontrak Berakhir',
      cell: ({ getValue }) => {
        const val = getValue()
        if (!val) return '-'
        const soon = new Date(val) <= new Date(Date.now() + 30 * 864e5)
        return (
          <span className={soon ? 'text-red-600 font-semibold' : ''}>
            {formatDate(val, 'dd/MM/yyyy')}
          </span>
        )
      },
    },
    {
      id: 'aksi',
      header: 'Aksi',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={`/karyawan/${row.original._id || row.original.id}`}
            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Detail">
            <Eye className="w-4 h-4" />
          </Link>
          <button onClick={() => { setEditData(row.original); setShowModal(true) }}
            className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors" title="Edit">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteId(row.original._id || row.original.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors" title="Hapus">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ], [])

  const exportExcel = async () => {
    const res = await fetch('/api/laporan/karyawan?format=excel')
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data-karyawan.xlsx'
      a.click()
    }
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Karyawan"
        subtitle={`Total ${total} karyawan terdaftar`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Karyawan' }]}
        actions={
          <>
            <button onClick={exportExcel} className="btn-secondary">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
              <Plus className="w-4 h-4" /> Tambah Karyawan
            </button>
          </>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, NIK, jabatan..."
              className="form-input pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <select className="form-select w-full sm:w-40" value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Status</option>
            <option value="PKWTT">PKWTT</option>
            <option value="PKWT">PKWT</option>
            <option value="PROBATION">Probation</option>
          </select>
          <select className="form-select w-full sm:w-48" value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}>
            <option value="">Semua Departemen</option>
            {DEPARTEMEN_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="page-section">
        <DataTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="Belum ada data karyawan"
        />
        {!isLoading && rows.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} dari {total} data
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <KaryawanModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={() => {
          setShowModal(false)
          setEditData(null)
          queryClient.invalidateQueries({ queryKey: ['karyawan'] })
        }}
        editData={editData}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus data karyawan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
