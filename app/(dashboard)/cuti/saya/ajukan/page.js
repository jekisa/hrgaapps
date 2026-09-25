'use client'

import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Plane } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import leaveUtils from '@/lib/leave-utils'
import leaveForm from '@/lib/leave-form'
import StaffDatePicker from '@/components/ui/StaffDatePicker'
import StaffFileDropzone from '@/components/ui/StaffFileDropzone'
import { validateStaffAttachment } from '@/lib/staff-file'

const { countBusinessDays } = leaveUtils
const { buildLeaveSubmission, isLeaveAttachmentRequired } = leaveForm

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Gagal memproses pengajuan')
  return payload
}

export default function AjukanCutiPage() {
  const { register, handleSubmit, watch, reset, control, formState: { errors, isSubmitting } } = useForm()
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
      const attachmentValidation = validateStaffAttachment(data.file?.[0])
      if (!attachmentValidation.valid) throw new Error(attachmentValidation.error)

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
    <div className="staff-theme">
      <PageHeader
        title="Ajukan Cuti"
        subtitle="Kirim pengajuan cuti untuk direview admin"
        breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Cuti Saya' }, { label: 'Ajukan Cuti' }]}
      />
      <form onSubmit={handleSubmit(onSubmit)} className="staff-leave-form max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
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
            <Controller name="startDate" control={control} rules={{ required: 'Tanggal mulai wajib diisi' }} render={({ field }) => <StaffDatePicker id="startDate" label="Tanggal Mulai" value={field.value} onChange={field.onChange} error={errors.startDate?.message} />} />
          </div>
          <div>
            <Controller name="endDate" control={control} rules={{ required: 'Tanggal selesai wajib diisi' }} render={({ field }) => <StaffDatePicker id="endDate" label="Tanggal Selesai" value={field.value} onChange={field.onChange} error={errors.endDate?.message} />} />
          </div>
          <div className="staff-day-count md:col-span-2 rounded-full bg-slate-50 px-4 py-3 text-sm text-slate-600" data-positive={totalDays > 0} aria-live="polite">
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
            <Controller name="file" control={control} rules={{ validate: (files) => !attachmentRequired || files?.length > 0 || 'Surat dokter wajib untuk cuti sakit' }} render={({ field }) => <StaffFileDropzone value={field.value} onChange={field.onChange} required={attachmentRequired} error={errors.file?.message} />} />
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            <Plane className="h-4 w-4" />{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
          </button>
        </div>
      </form>
    </div>
  )
}
