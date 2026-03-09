'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

export default function JadwalModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()

  const { data: kendaraanResult } = useQuery({
    queryKey: ['kendaraan-tersedia'],
    queryFn: () => fetch('/api/kendaraan?status=TERSEDIA&limit=100').then(r => r.json()),
    enabled: isOpen,
  })

  const kendaraanList = kendaraanResult?.data || []

  useEffect(() => {
    if (isOpen) reset({ tanggalBerangkat: new Date().toISOString().split('T')[0] })
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/kendaraan/jadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
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
