'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Calendar, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function JadwalModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [kendaraanList, setKendaraanList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/kendaraan?status=TERSEDIA&limit=100').then(r => r.json()).then(d => setKendaraanList(d.data || []))
      reset({ tanggalBerangkat: new Date().toISOString().split('T')[0] })
    }
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/jadwal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Jadwal dibuat')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Jadwal Pemakaian Kendaraan" size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="jadwal-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="jadwal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Kendaraan <span className="text-red-500">*</span></label>
          <select className="form-select" {...register('kendaraanId', { required: true })}>
            <option value="">- Pilih Kendaraan -</option>
            {kendaraanList.map((k) => <option key={k.id} value={k.id}>{k.noPol} - {k.merk} {k.model}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tgl Berangkat</label>
            <input type="datetime-local" className="form-input" {...register('tanggalBerangkat')} />
          </div>
          <div>
            <label className="form-label">Tgl Kembali</label>
            <input type="datetime-local" className="form-input" {...register('tanggalKembali')} />
          </div>
        </div>
        <div>
          <label className="form-label">Pengemudi</label>
          <input className="form-input" placeholder="Nama pengemudi" {...register('pengemudi')} />
        </div>
        <div>
          <label className="form-label">Tujuan</label>
          <input className="form-input" placeholder="Kota / alamat tujuan" {...register('tujuan')} />
        </div>
        <div>
          <label className="form-label">Keperluan</label>
          <textarea className="form-input" rows={2} placeholder="Tujuan perjalanan dinas" {...register('keperluan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function JadwalKendaraanPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, limit: 10, ...(statusFilter && { status: statusFilter }) })
      const res = await fetch(`/api/kendaraan/jadwal?${params}`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/kendaraan/jadwal', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
      if (res.ok) { toast.success('Status diperbarui'); fetchData() }
      else toast.error('Gagal update status')
    } catch { toast.error('Terjadi kesalahan') }
  }

  return (
    <div>
      <PageHeader
        title="Jadwal Pemakaian Kendaraan"
        subtitle={`${total} jadwal tercatat`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Jadwal' }]}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Buat Jadwal
          </button>
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex gap-2 flex-wrap">
          {['', 'TERJADWAL', 'BERLANGSUNG', 'SELESAI', 'DIBATALKAN'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${statusFilter === s ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              {s || 'Semua'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={Calendar} title="Tidak ada jadwal" /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Kendaraan</th>
                    <th className="table-th">Pengemudi</th>
                    <th className="table-th">Tujuan / Keperluan</th>
                    <th className="table-th">Berangkat</th>
                    <th className="table-th">Kembali</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50">
                      <td className="table-td">
                        <p className="font-mono font-bold text-sm">{j.kendaraan.noPol}</p>
                        <p className="text-xs text-gray-400">{j.kendaraan.merk} {j.kendaraan.model}</p>
                      </td>
                      <td className="table-td">{j.pengemudi || '-'}</td>
                      <td className="table-td">
                        <p className="font-medium">{j.tujuan || '-'}</p>
                        <p className="text-xs text-gray-400">{j.keperluan || '-'}</p>
                      </td>
                      <td className="table-td">{formatDate(j.tanggalBerangkat, 'dd/MM/yyyy HH:mm')}</td>
                      <td className="table-td">{j.tanggalKembali ? formatDate(j.tanggalKembali, 'dd/MM/yyyy HH:mm') : '-'}</td>
                      <td className="table-td"><Badge status={j.status} /></td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          {j.status === 'TERJADWAL' && (
                            <>
                              <button onClick={() => updateStatus(j.id, 'BERLANGSUNG')} className="p-1.5 rounded hover:bg-blue-50 text-blue-600" title="Mulai">
                                <Calendar className="w-4 h-4" />
                              </button>
                              <button onClick={() => updateStatus(j.id, 'DIBATALKAN')} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Batalkan">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {j.status === 'BERLANGSUNG' && (
                            <button onClick={() => updateStatus(j.id, 'SELESAI')} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Selesaikan">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} jadwal</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <JadwalModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </div>
  )
}
