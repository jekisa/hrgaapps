'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

const JENIS_PERAWATAN = ['SERVICE_RUTIN', 'GANTI_OLI', 'TUNE_UP', 'GANTI_BAN', 'PERBAIKAN', 'LAINNYA']

export default function PerawatanModal({ isOpen, onClose, onSaved, editData }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: kendaraanResult } = useQuery({
    queryKey: ['kendaraan-all'],
    queryFn: () => fetch('/api/kendaraan?limit=100').then(r => r.json()),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const kendaraanList = kendaraanResult?.data || []

  useEffect(() => {
    if (isOpen) {
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
      const res = await fetch('/api/kendaraan/perawatan', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
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
