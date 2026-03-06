'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal, { ConfirmModal } from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function PeminjamanModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [asetList, setAsetList] = useState([])
  const [karyawanList, setKaryawanList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/aset?status=AKTIF&limit=100').then(r => r.json()).then(d => setAsetList(d.data || []))
      fetch('/api/karyawan?limit=100').then(r => r.json()).then(d => setKaryawanList(d.data || []))
      reset({ tanggalPinjam: new Date().toISOString().split('T')[0] })
    }
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/aset/peminjaman', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Peminjaman berhasil dibuat')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Peminjaman Aset" size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="pinjam-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="pinjam-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Aset <span className="text-red-500">*</span></label>
          <select className="form-select" {...register('asetId', { required: 'Pilih aset' })}>
            <option value="">- Pilih Aset -</option>
            {asetList.map((a) => <option key={a.id} value={a.id}>{a.namaAset} ({a.kodeAset})</option>)}
          </select>
          {errors.asetId && <p className="text-xs text-red-500 mt-1">{errors.asetId.message}</p>}
        </div>
        <div>
          <label className="form-label">Karyawan <span className="text-red-500">*</span></label>
          <select className="form-select" {...register('karyawanId', { required: 'Pilih karyawan' })}>
            <option value="">- Pilih Karyawan -</option>
            {karyawanList.map((k) => <option key={k.id} value={k.id}>{k.nama} - {k.jabatan}</option>)}
          </select>
          {errors.karyawanId && <p className="text-xs text-red-500 mt-1">{errors.karyawanId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tgl Pinjam</label>
            <input type="date" className="form-input" {...register('tanggalPinjam', { required: true })} />
          </div>
          <div>
            <label className="form-label">Rencana Kembali</label>
            <input type="date" className="form-input" {...register('tanggalRencanaKembali')} />
          </div>
        </div>
        <div>
          <label className="form-label">Keperluan</label>
          <input className="form-input" placeholder="WFH, Dinas, dll" {...register('keperluan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function PeminjamanAsetPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('DIPINJAM')
  const [showModal, setShowModal] = useState(false)
  const [returnId, setReturnId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/aset/peminjaman?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleReturn = async () => {
    try {
      const res = await fetch('/api/aset/peminjaman', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: returnId }) })
      if (res.ok) { toast.success('Aset berhasil dikembalikan'); fetchData() }
      else toast.error('Gagal proses pengembalian')
    } finally { setReturnId(null) }
  }

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
        <div className="flex gap-3">
          <select className="form-select w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Semua Status</option>
            <option value="DIPINJAM">Dipinjam</option>
            <option value="DIKEMBALIKAN">Dikembalikan</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState title="Tidak ada data peminjaman" /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Aset</th>
                    <th className="table-th">Karyawan</th>
                    <th className="table-th">Keperluan</th>
                    <th className="table-th">Tgl Pinjam</th>
                    <th className="table-th">Rencana Kembali</th>
                    <th className="table-th">Tgl Kembali</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <p className="font-medium">{p.aset.namaAset}</p>
                        <p className="text-xs text-gray-400">{p.aset.kodeAset}</p>
                      </td>
                      <td className="table-td">
                        <p className="font-medium">{p.karyawan.nama}</p>
                        <p className="text-xs text-gray-400">{p.karyawan.jabatan}</p>
                      </td>
                      <td className="table-td">{p.keperluan || '-'}</td>
                      <td className="table-td">{formatDate(p.tanggalPinjam)}</td>
                      <td className="table-td">
                        {p.tanggalRencanaKembali ? (
                          <span className={new Date(p.tanggalRencanaKembali) < new Date() && p.status === 'DIPINJAM' ? 'text-red-600 font-medium' : ''}>
                            {formatDate(p.tanggalRencanaKembali)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="table-td">{p.tanggalKembali ? formatDate(p.tanggalKembali) : '-'}</td>
                      <td className="table-td"><Badge status={p.status} /></td>
                      <td className="table-td">
                        {p.status === 'DIPINJAM' && (
                          <button onClick={() => setReturnId(p.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Kembalikan">
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} peminjaman</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <PeminjamanModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
      <ConfirmModal isOpen={!!returnId} onClose={() => setReturnId(null)} onConfirm={handleReturn} title="Konfirmasi Pengembalian" message="Konfirmasi bahwa aset telah dikembalikan?" footer />
    </div>
  )
}
