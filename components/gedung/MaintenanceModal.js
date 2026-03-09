'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

const KATEGORI = ['LISTRIK', 'PLUMBING', 'AC', 'FURNITURE', 'KEAMANAN', 'KEBERSIHAN', 'LAINNYA']
const PRIORITAS = ['LOW', 'NORMAL', 'HIGH', 'URGENT']
const STATUS = ['PENDING', 'PROSES', 'SELESAI', 'DITOLAK']

export default function MaintenanceModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    if (editData) {
      reset({ ...editData, biaya: editData.biaya || '' })
    } else {
      reset({ prioritas: 'NORMAL', status: 'PENDING' })
    }
  }, [editData, reset, isOpen])

  const onSubmit = async (data) => {
    try {
      const id = editData?._id || editData?.id
      const url = id ? `/api/gedung/maintenance/${id}` : '/api/gedung/maintenance'
      const method = id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      toast.success(id ? 'Request diperbarui' : 'Request dibuat')
      onSaved()
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editData ? 'Update Maintenance Request' : 'Buat Maintenance Request'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn-secondary">Batal</button>
          <button type="submit" form="maint-form" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
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
