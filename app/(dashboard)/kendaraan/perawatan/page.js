'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Wrench, Edit } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency, formatNumber } from '@/lib/utils'
import { useForm } from 'react-hook-form'

const JENIS_PERAWATAN = ['SERVICE_RUTIN', 'GANTI_OLI', 'TUNE_UP', 'GANTI_BAN', 'PERBAIKAN', 'LAINNYA']

function PerawatanModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [kendaraanList, setKendaraanList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/kendaraan?limit=100').then(r => r.json()).then(d => setKendaraanList(d.data || []))
      if (editData) {
        reset({ ...editData, tanggal: editData.tanggal?.split('T')[0] })
      } else {
        reset({ tanggal: new Date().toISOString().split('T')[0], status: 'TERJADWAL', jenisPerawatan: 'SERVICE_RUTIN' })
      }
    }
  }, [isOpen, editData, reset])

  const onSubmit = async (data) => {
    try {
      const method = editData ? 'PUT' : 'POST'
      const body = editData ? { ...data, id: editData.id } : data
      const res = await fetch('/api/kendaraan/perawatan', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(editData ? 'Data diperbarui' : 'Jadwal perawatan ditambahkan')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Perawatan' : 'Tambah Jadwal Perawatan'} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="per-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="per-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Kendaraan <span className="text-red-500">*</span></label>
            <select className="form-select" {...register('kendaraanId', { required: true })} disabled={!!editData}>
              <option value="">- Pilih -</option>
              {kendaraanList.map((k) => <option key={k.id} value={k.id}>{k.noPol} - {k.merk}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Jenis Perawatan</label>
            <select className="form-select" {...register('jenisPerawatan')}>
              {JENIS_PERAWATAN.map((j) => <option key={j} value={j}>{j.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tanggal</label>
            <input type="date" className="form-input" {...register('tanggal')} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" {...register('status')}>
              <option value="TERJADWAL">Terjadwal</option>
              <option value="SELESAI">Selesai</option>
            </select>
          </div>
          <div>
            <label className="form-label">Bengkel</label>
            <input className="form-input" placeholder="Nama bengkel / vendor" {...register('bengkel')} />
          </div>
          <div>
            <label className="form-label">Biaya (Rp)</label>
            <input type="number" className="form-input" {...register('biaya')} />
          </div>
          <div>
            <label className="form-label">KM Servis</label>
            <input type="number" className="form-input" {...register('kmServis')} />
          </div>
          <div>
            <label className="form-label">KM Servis Berikutnya</label>
            <input type="number" className="form-input" {...register('kmServisBerikutnya')} />
          </div>
        </div>
        <div>
          <label className="form-label">Deskripsi</label>
          <textarea className="form-input" rows={2} {...register('deskripsi')} />
        </div>
      </form>
    </Modal>
  )
}

export default function PerawatanPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/kendaraan/perawatan?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  return (
    <div>
      <PageHeader
        title="Perawatan & Servis Kendaraan"
        subtitle="Jadwal dan riwayat perawatan kendaraan"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Perawatan' }]}
        actions={
          <button onClick={() => { setEditData(null); setShowModal(true) }} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Jadwal
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex gap-2">
          {['', 'TERJADWAL', 'SELESAI'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={Wrench} title="Tidak ada data perawatan" /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Kendaraan</th>
                    <th className="table-th">Jenis</th>
                    <th className="table-th">Tanggal</th>
                    <th className="table-th">Bengkel</th>
                    <th className="table-th">KM Servis</th>
                    <th className="table-th">KM Berikutnya</th>
                    <th className="table-th">Biaya</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <p className="font-mono font-bold text-sm">{p.kendaraan.noPol}</p>
                        <p className="text-xs text-gray-400">{p.kendaraan.merk} {p.kendaraan.model}</p>
                      </td>
                      <td className="table-td">{p.jenisPerawatan?.replace('_', ' ') || '-'}</td>
                      <td className="table-td">{formatDate(p.tanggal)}</td>
                      <td className="table-td">{p.bengkel || '-'}</td>
                      <td className="table-td">{p.kmServis ? formatNumber(p.kmServis) + ' km' : '-'}</td>
                      <td className="table-td">{p.kmServisBerikutnya ? formatNumber(p.kmServisBerikutnya) + ' km' : '-'}</td>
                      <td className="table-td">{formatCurrency(p.biaya)}</td>
                      <td className="table-td"><Badge status={p.status} /></td>
                      <td className="table-td">
                        <button onClick={() => { setEditData(p); setShowModal(true) }} className="p-1.5 rounded hover:bg-green-50 text-green-600">
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} data</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <PerawatanModal isOpen={showModal} onClose={() => { setShowModal(false); setEditData(null) }} onSaved={() => { setShowModal(false); setEditData(null); fetchData() }} editData={editData} />
    </div>
  )
}
