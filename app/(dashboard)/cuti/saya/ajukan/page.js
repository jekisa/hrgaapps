'use client'

import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import leaveUtils from '@/lib/leave-utils'
import leaveForm from '@/lib/leave-form'

const { countBusinessDays } = leaveUtils
const { buildLeaveSubmission, isLeaveAttachmentRequired } = leaveForm

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Gagal memproses pengajuan')
  return payload
}

export default function AjukanCutiPage() {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm()
  const { data: typeData } = useQuery({
    queryKey: ['cuti', 'jenis'],
    queryFn: () => fetchJson('/api/cuti/jenis'),
  })
  const leaveTypeId = watch('leaveTypeId')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const selectedType = useMemo(
    () => (typeData?.data || []).find((item) => item._id === leaveTypeId),
    [typeData, leaveTypeId],
  )
  const attachmentRequired = isLeaveAttachmentRequired(selectedType)
  let totalDays = 0
  try {
    if (startDate && endDate) totalDays = countBusinessDays(startDate, endDate)
  } catch {
    totalDays = 0
  }

  const onSubmit = async (data) => {
    try {
      if (!selectedType) throw new Error('Pilih jenis cuti')
      if (attachmentRequired && !data.file?.[0]) throw new Error('Surat dokter wajib untuk cuti sakit')

      let attachmentUrl = null
      if (data.file?.[0]) {
        const formData = new FormData()
        formData.append('file', data.file[0])
        const upload = await fetchJson('/api/cuti/upload', { method: 'POST', body: formData })
        attachmentUrl = upload.attachmentUrl
      }

      await fetchJson('/api/cuti/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildLeaveSubmission({ ...data, attachmentUrl })),
      })
      toast.success('Pengajuan cuti berhasil dikirim, menunggu persetujuan admin')
      reset()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Ajukan Cuti"
        subtitle="Kirim pengajuan cuti untuk direview admin"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Cuti Saya' }, { label: 'Ajukan Cuti' }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="form-label">Jenis Cuti <span className="text-red-500">*</span></label>
            <select className="form-select" {...register('leaveTypeId', { required: 'Jenis cuti wajib dipilih' })}>
              <option value="">Pilih jenis cuti</option>
              {(typeData?.data || []).map((item) => (
                <option key={item._id} value={item._id}>{item.name} · kuota {item.defaultQuotaPerYear} hari</option>
              ))}
            </select>
            {errors.leaveTypeId && <p className="mt-1 text-xs text-red-500">{errors.leaveTypeId.message}</p>}
          </div>
          <div>
            <label className="form-label">Tanggal Mulai <span className="text-red-500">*</span></label>
            <input type="date" className="form-input" {...register('startDate', { required: 'Tanggal mulai wajib diisi' })} />
            {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="form-label">Tanggal Selesai <span className="text-red-500">*</span></label>
            <input type="date" className="form-input" {...register('endDate', { required: 'Tanggal selesai wajib diisi' })} />
            {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
          </div>
          <div className="md:col-span-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Total hari kerja: <strong className="text-slate-900">{totalDays} hari</strong>
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Alasan</label>
            <textarea className="form-input min-h-28" {...register('reason')} placeholder="Jelaskan alasan pengajuan cuti" />
          </div>
          <div id="lampiran" className="md:col-span-2">
            <label className="form-label">
              Surat dokter / lampiran{' '}
              {attachmentRequired
                ? <span className="text-red-500">* Wajib</span>
                : <span className="text-slate-400">(Opsional)</span>}
            </label>
            <div className="rounded-xl border border-dashed border-slate-300 p-4">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                required={attachmentRequired}
                {...register('file', { required: attachmentRequired ? 'Surat dokter wajib untuk cuti sakit' : false })}
              />
              <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                <UploadCloud className="h-3.5 w-3.5" />PDF/JPG/PNG, maksimal 5 MB
              </p>
              {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file.message}</p>}
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>
    </div>
  )
}
