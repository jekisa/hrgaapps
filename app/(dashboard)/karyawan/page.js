'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, DEPARTEMEN_LIST } from '@/lib/utils'
import KaryawanModal from '@/components/karyawan/KaryawanModal'

export default function KaryawanPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(deptFilter && { departemen: deptFilter }),
      })
      const res = await fetch(`/api/karyawan?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, deptFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/karyawan/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Karyawan berhasil dihapus')
        fetchData()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal menghapus')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleSaved = () => {
    setShowModal(false)
    setEditData(null)
    fetchData()
  }

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
              <Download className="w-4 h-4" />
              Export
            </button>
            <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
              <Plus className="w-4 h-4" />
              Tambah Karyawan
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
          <select
            className="form-select w-full sm:w-48"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          >
            <option value="">Semua Status</option>
            <option value="PKWTT">PKWTT</option>
            <option value="PKWT">PKWT</option>
            <option value="PROBATION">Probation</option>
          </select>
          <select
            className="form-select w-full sm:w-48"
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}
          >
            <option value="">Semua Departemen</option>
            {DEPARTEMEN_LIST.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Belum ada data karyawan"
            description="Klik tombol Tambah Karyawan untuk menambahkan data"
            action={
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-4 h-4" /> Tambah Karyawan
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">NIK</th>
                    <th className="table-th">Nama</th>
                    <th className="table-th">Jabatan</th>
                    <th className="table-th">Departemen</th>
                    <th className="table-th">Status Kontrak</th>
                    <th className="table-th">Tgl Masuk</th>
                    <th className="table-th">Kontrak Berakhir</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((k) => (
                    <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-td font-mono text-xs">{k.nik}</td>
                      <td className="table-td">
                        <div className="font-medium text-gray-900">{k.nama}</div>
                        <div className="text-xs text-gray-400">{k.email || k.telepon}</div>
                      </td>
                      <td className="table-td">{k.jabatan || '-'}</td>
                      <td className="table-td">{k.departemen || '-'}</td>
                      <td className="table-td">
                        <Badge status={k.statusKontrak} />
                      </td>
                      <td className="table-td">{formatDate(k.tanggalMasuk, 'dd/MM/yyyy')}</td>
                      <td className="table-td">
                        {k.tanggalKontrakBerakhir ? (
                          <span className={
                            new Date(k.tanggalKontrakBerakhir) <= new Date(Date.now() + 30 * 864e5)
                              ? 'text-red-600 font-medium'
                              : ''
                          }>
                            {formatDate(k.tanggalKontrakBerakhir, 'dd/MM/yyyy')}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/karyawan/${k.id}`}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                            title="Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => { setEditData(k); setShowModal(true) }}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(k.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Menampilkan {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} dari {total} data
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <KaryawanModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        onSaved={handleSaved}
        editData={editData}
      />

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Hapus Karyawan"
        message="Apakah Anda yakin ingin menghapus data karyawan ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
