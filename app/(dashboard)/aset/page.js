'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Eye, Edit, Trash2, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatCurrency } from '@/lib/utils'
import AsetModal from '@/components/aset/AsetModal'
import Link from 'next/link'

const KATEGORI = ['ELEKTRONIK', 'PERALATAN', 'KENDARAAN', 'FURNITURE', 'LAINNYA']
const STATUS = ['AKTIF', 'DIPINJAM', 'RUSAK', 'DISPOSAL']

export default function AsetPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [kategoriFilter, setKategoriFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(kategoriFilter && { kategori: kategoriFilter }),
      })
      const res = await fetch(`/api/aset?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, kategoriFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/aset/${deleteId}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Aset dihapus'); fetchData() }
      else { const e = await res.json(); toast.error(e.error || 'Gagal') }
    } finally { setDeleting(false); setDeleteId(null) }
  }

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
            <input
              className="form-input pl-9"
              placeholder="Cari nama atau kode aset..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
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

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? (
          <EmptyState icon={Package} title="Belum ada aset" action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus className="w-4 h-4" />Tambah Aset</button>} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Kode</th>
                    <th className="table-th">Nama Aset</th>
                    <th className="table-th">Kategori</th>
                    <th className="table-th">Merk / Model</th>
                    <th className="table-th">Kondisi</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Nilai</th>
                    <th className="table-th">Lokasi</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="table-td font-mono text-xs">{a.kodeAset}</td>
                      <td className="table-td font-medium">{a.namaAset}</td>
                      <td className="table-td"><span className="badge bg-gray-100 text-gray-700">{a.kategori}</span></td>
                      <td className="table-td">{[a.merk, a.model].filter(Boolean).join(' / ') || '-'}</td>
                      <td className="table-td"><Badge status={a.kondisi} /></td>
                      <td className="table-td"><Badge status={a.status} /></td>
                      <td className="table-td">{formatCurrency(a.nilaiPerolehan)}</td>
                      <td className="table-td">{a.lokasi || '-'}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditData(a); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(a.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} aset</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <AsetModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Hapus Aset" />
    </div>
  )
}
