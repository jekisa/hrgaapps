'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

export default function LogModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: kendaraanResult } = useQuery({
    queryKey: ['kendaraan-all'],
    queryFn: () => fetch('/api/kendaraan?limit=100').then(r => r.json()),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const { data: karyawanResult } = useQuery({
    queryKey: ['karyawan-list'],
    queryFn: () => fetch('/api/karyawan?limit=100').then(r => r.json()),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const kendaraanList = kendaraanResult?.data || []
  const karyawanList = karyawanResult?.data || []

  useEffect(() => {
    if (isOpen) reset({ tanggal: new Date().toISOString().split('T')[0] })
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/log-perjalanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
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
