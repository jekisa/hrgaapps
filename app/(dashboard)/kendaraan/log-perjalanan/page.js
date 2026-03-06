'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Pagination from '@/components/ui/Pagination'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, formatNumber } from '@/lib/utils'
import { useForm } from 'react-hook-form'

function LogModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [kendaraanList, setKendaraanList] = useState([])
  const [karyawanList, setKaryawanList] = useState([])

  useEffect(() => {
    if (isOpen) {
      fetch('/api/kendaraan?limit=100').then(r => r.json()).then(d => setKendaraanList(d.data || []))
      fetch('/api/karyawan?limit=100').then(r => r.json()).then(d => setKaryawanList(d.data || []))
      reset({ tanggal: new Date().toISOString().split('T')[0] })
    }
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/log-perjalanan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success('Log perjalanan disimpan')
      onSaved()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah Log Perjalanan" size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="log-form" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
        </>
      }
    >
      <form id="log-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Kendaraan <span className="text-red-500">*</span></label>
            <select className="form-select" {...register('kendaraanId', { required: true })}>
              <option value="">- Pilih -</option>
              {kendaraanList.map((k) => <option key={k.id} value={k.id}>{k.noPol} - {k.merk}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Pengemudi / Karyawan</label>
            <select className="form-select" {...register('karyawanId')}>
              <option value="">- Pilih -</option>
              {karyawanList.map((k) => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Tanggal</label>
            <input type="date" className="form-input" {...register('tanggal')} />
          </div>
          <div>
            <label className="form-label">Tujuan</label>
            <input className="form-input" placeholder="Kota / lokasi tujuan" {...register('tujuan')} />
          </div>
          <div>
            <label className="form-label">KM Awal</label>
            <input type="number" className="form-input" {...register('kmAwal')} />
          </div>
          <div>
            <label className="form-label">KM Akhir</label>
            <input type="number" className="form-input" {...register('kmAkhir')} />
          </div>
          <div>
            <label className="form-label">BBM (liter)</label>
            <input type="number" step="0.1" className="form-input" {...register('bbm')} />
          </div>
        </div>
        <div>
          <label className="form-label">Keperluan</label>
          <textarea className="form-input" rows={2} {...register('keperluan')} />
        </div>
        <div>
          <label className="form-label">Keterangan</label>
          <textarea className="form-input" rows={2} {...register('keterangan')} />
        </div>
      </form>
    </Modal>
  )
}

export default function LogPerjalananPage() {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/kendaraan/log-perjalanan?page=${page}&limit=10`)
      const json = await res.json()
      setData(json.data || [])
      setTotal(json.total || 0)
      setTotalPages(json.totalPages || 1)
    } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchData() }, [fetchData])

  const totalKm = data.reduce((sum, d) => sum + (d.totalKm || 0), 0)

  return (
    <div>
      <PageHeader
        title="Log Perjalanan Dinas"
        subtitle={`${total} record perjalanan`}
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Kendaraan', href: '/kendaraan' }, { label: 'Log Perjalanan' }]}
        actions={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Tambah Log
          </button>
        }
      />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total Perjalanan (halaman ini)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{data.length}</p>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500">Total KM (halaman ini)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalKm)} km</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : data.length === 0 ? <EmptyState icon={MapPin} title="Belum ada log perjalanan" /> : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="table-th">Tanggal</th>
                    <th className="table-th">Kendaraan</th>
                    <th className="table-th">Pengemudi</th>
                    <th className="table-th">Tujuan</th>
                    <th className="table-th">KM Awal</th>
                    <th className="table-th">KM Akhir</th>
                    <th className="table-th">Total KM</th>
                    <th className="table-th">BBM (L)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50">
                      <td className="table-td">{formatDate(l.tanggal, 'dd/MM/yyyy')}</td>
                      <td className="table-td">
                        <p className="font-mono font-bold text-sm">{l.kendaraan.noPol}</p>
                        <p className="text-xs text-gray-400">{l.kendaraan.merk}</p>
                      </td>
                      <td className="table-td">{l.karyawan?.nama || l.keperluan || '-'}</td>
                      <td className="table-td">{l.tujuan || '-'}</td>
                      <td className="table-td">{l.kmAwal ? formatNumber(l.kmAwal) : '-'}</td>
                      <td className="table-td">{l.kmAkhir ? formatNumber(l.kmAkhir) : '-'}</td>
                      <td className="table-td font-semibold">{l.totalKm ? formatNumber(l.totalKm) : '-'}</td>
                      <td className="table-td">{l.bbm || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
              <p className="text-xs text-gray-500">Total {total} perjalanan</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <LogModal isOpen={showModal} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </div>
  )
}
