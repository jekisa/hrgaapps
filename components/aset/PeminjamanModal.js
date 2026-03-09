'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'

export default function PeminjamanModal({ isOpen, onClose, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()

  const { data: asetResult } = useQuery({
    queryKey: ['aset-aktif'],
    queryFn: () => fetch('/api/aset?status=AKTIF&limit=100').then(r => r.json()),
    enabled: isOpen,
  })

  const { data: karyawanResult } = useQuery({
    queryKey: ['karyawan-list'],
    queryFn: () => fetch('/api/karyawan?limit=100').then(r => r.json()),
    enabled: isOpen,
    staleTime: 1000 * 60 * 5,
  })

  const asetList = asetResult?.data || []
  const karyawanList = karyawanResult?.data || []

  useEffect(() => {
    if (isOpen) reset({ tanggalPinjam: new Date().toISOString().split('T')[0] })
  }, [isOpen, reset])

  const onSubmit = async (data) => {
    try {
      const res = await fetch('/api/aset/peminjaman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
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
