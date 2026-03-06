'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const KATEGORI = ['LISTRIK', 'PLUMBING', 'AC', 'FURNITURE', 'KEAMANAN', 'KEBERSIHAN', 'LAINNYA']
const PRIORITAS = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
const STATUS = ['PENDING', 'PROSES', 'SELESAI', 'DITOLAK']

function MaintenanceModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm()
  const status = watch('status')

  useEffect(() => {
    if (editData) {
      reset({ ...editData, biaya: editData.biaya || '' })
    } else {
      reset({ prioritas: 'NORMAL', status: 'PENDING' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const url = editData ? `/api/gedung/maintenance/${editData.id}` : '/api/gedung/maintenance'
      const method = editData ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(editData ? 'Request diperbarui' : 'Request dibuat')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Update Maintenance Request' : 'Buat Maintenance Request'} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="maint-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="maint-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Judul Request <span className="text-red-500">*</span></label>
          <input className="form-input" {...register('judul', { required: true })} placeholder="Perbaikan AC Ruang Meeting" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Lokasi</label>
            <input className="form-input" placeholder="Lantai 2, Ruang Rapat" {...register('lokasi')} />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-select" {...register('kategori')}>
              <option value="">- Pilih -</option>
              {KATEGORI.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Prioritas</label>
            <select className="form-select" {...register('prioritas')}>
              {PRIORITAS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Pemohon</label>
            <input className="form-input" placeholder="Nama pemohon" {...register('pemohon')} />
          </div>
          <div>
            <label className="form-label">Pelaksana</label>
            <input className="form-input" placeholder="Teknisi / vendor" {...register('pelaksana')} />
          </div>
          {editData && (
            <div>
              <label className="form-label">Biaya (Rp)</label>
              <input type="number" className="form-input" {...register('biaya')} />
            </div>
          )}
        </div>
        <div>
          <label className="form-label">Deskripsi</label>
          <textarea className="form-input" rows={3} placeholder="Jelaskan detail kerusakan/pekerjaan..." {...register('deskripsi')} />
        </div>
        <div>
          <label className="form-label">Keterangan</label>
          <textarea className="form-input" rows={2} {...register('keterangan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function MaintenancePage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [prioritasFilter, setPrioritasFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(search && { search }), ...(statusFilter && { status: statusFilter }), ...(prioritasFilter && { prioritas: prioritasFilter }) })
      const res = await fetch(`/api/gedung/maintenance?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, search, statusFilter, prioritasFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleDelete = async () => {
    try {
      await fetch(`/api/gedung/maintenance/${deleteId}`, { method: 'DELETE' })
      toast.success('Request dihapus')
      fetchData()
    } finally { setDeleteId(null) }
  }

  // Summary counts
  const summary = { PENDING: 0, PROSES: 0, SELESAI: 0, DITOLAK: 0 }
  data.forEach((d) => { if (summary[d.status] !== undefined) summary[d.status]++ })

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

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Pending', status: 'PENDING', color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
          { label: 'Proses', status: 'PROSES', color: 'border-blue-200 bg-blue-50 text-blue-700' },
          { label: 'Selesai', status: 'SELESAI', color: 'border-green-200 bg-green-50 text-green-700' },
          { label: 'Ditolak', status: 'DITOLAK', color: 'border-red-200 bg-red-50 text-red-700' },
        ].map((item) => (
          <button key={item.status} onClick={() => setStatusFilter(statusFilter === item.status ? '' : item.status)}
            className={`card p-3 border text-left transition-all ${item.color} ${statusFilter === item.status ? 'ring-2 ring-offset-1' : ''}`}
          >
            <p className="text-xl font-bold">{summary[item.status]}</p>
            <p className="text-xs">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input className="form-input pl-9" placeholder="Cari judul atau lokasi..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-select w-full sm:w-40" value={prioritasFilter} onChange={(e) => setPrioritasFilter(e.target.value)}>
            <option value="">Semua Prioritas</option>
            {PRIORITAS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={Wrench} title="Tidak ada maintenance request" /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Judul</th>
                    <th className="table-th">Lokasi</th>
                    <th className="table-th">Kategori</th>
                    <th className="table-th">Prioritas</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Pemohon</th>
                    <th className="table-th">Tgl Request</th>
                    <th className="table-th">Biaya</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <p className="font-medium">{m.judul}</p>
                        {m.deskripsi && <p className="text-xs text-gray-400 truncate max-w-48">{m.deskripsi}</p>}
                      </td>
                      <td className="table-td">{m.lokasi || '-'}</td>
                      <td className="table-td">{m.kategori || '-'}</td>
                      <td className="table-td"><Badge status={m.prioritas} /></td>
                      <td className="table-td"><Badge status={m.status} /></td>
                      <td className="table-td">{m.pemohon || '-'}</td>
                      <td className="table-td">{formatDate(m.tanggalRequest)}</td>
                      <td className="table-td">{m.biaya ? formatCurrency(m.biaya) : '-'}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setEditData(m); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500">
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
              <p className="text-xs text-gray-500">Total {total} request</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <MaintenanceModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Hapus Request" />
    </div>
  )
}
