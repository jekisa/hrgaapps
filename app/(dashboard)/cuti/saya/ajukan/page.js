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
import { useSession } from 'next-auth/react'
import { getStaffSelectableLeaveTypes } from '@/lib/staff-leave-types'

const { countBusinessDays } = leaveUtils
const { buildLeaveSubmission, isLeaveAttachmentRequired } = leaveForm

async function fetchJson(url, options) {
  const response = await fetch(url, options)
  const payload = await response.json()
  if (!response.ok) throw new Error(payload.error || 'Gagal memproses pengajuan')
  return payload
}

export default function AjukanCutiPage() {
  const { data: session } = useSession()
  const { register, handleSubmit, watch, reset, control, formState: { errors, isSubmitting } } = useForm()
  const { data: typeData } = useQuery({
    queryKey: ['cuti', 'jenis'],
    queryFn: () => fetchJson('/api/cuti/jenis'),
  })
  const { data: profileData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchJson('/api/dashboard'),
  })
  const selectableLeaveTypes = useMemo(() => getStaffSelectableLeaveTypes(typeData?.data), [typeData])
  const leaveTypeId = watch('leaveTypeId')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const selectedType = useMemo(
    () => selectableLeaveTypes.find((item) => item._id === leaveTypeId),
    [selectableLeaveTypes, leaveTypeId],
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
      if (attachmentRequired && !data.file?.[0]) throw new Error('Lampiran wajib untuk jenis cuti ini')
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
      <form onSubmit={handleSubmit(onSubmit)} className="staff-leave-form w-full max-w-none rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:p-8">
        <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
          <div>
            <label className="form-label" htmlFor="employeeName">Nama Karyawan</label>
            <input id="employeeName" className="form-input bg-slate-50" value={profileData?.employee?.name || session?.user?.name || ''} readOnly aria-readonly="true" />
          </div>
          <div>
            <label className="form-label" htmlFor="employeePosition">Jabatan</label>
            <input id="employeePosition" className="form-input bg-slate-50" value={profileData?.employee?.position || ''} placeholder="Data jabatan tidak tersedia" readOnly aria-readonly="true" />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">Jenis Cuti <span className="text-red-500">*</span></label>
            <select className="form-select" {...register('leaveTypeId', { required: 'Jenis cuti wajib dipilih' })}>
              <option value="">Pilih jenis cuti</option>
              {selectableLeaveTypes.map((item) => (
                <option key={item._id} value={item._id}>{item.name} · kuota {item.defaultQuotaPerYear} hari</option>
              ))}
            </select>
            {errors.leaveTypeId && <p className="mt-1 text-xs text-red-500">{errors.leaveTypeId.message}</p>}
          </div>
          {selectedType?.code === 'sick' && <>
            <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Cuti sakit tidak mengurangi kuota cuti tahunan. Informasi dokter bersifat opsional; surat dokter tetap wajib diunggah.</div>
            <div><label className="form-label" htmlFor="doctorName">Nama dokter / klinik (opsional)</label><input id="doctorName" className="form-input" {...register('doctorName')} /></div>
            <div><label className="form-label" htmlFor="certificateNumber">Nomor surat (opsional)</label><input id="certificateNumber" className="form-input" {...register('certificateNumber')} /></div>
            <div className="md:col-span-2"><label className="form-label" htmlFor="additionalNotes">Catatan tambahan (opsional)</label><textarea id="additionalNotes" className="form-input min-h-24" {...register('additionalNotes')} /></div>
          </>}
          <div>
            <Controller name="startDate" control={control} rules={{ required: 'Tanggal mulai wajib diisi' }} render={({ field }) => <StaffDatePicker id="startDate" label="Tanggal Mulai" value={field.value} onChange={field.onChange} error={errors.startDate?.message} />} />
          </div>
          <div>
            <Controller name="endDate" control={control} rules={{ required: 'Tanggal selesai wajib diisi' }} render={({ field }) => <StaffDatePicker id="endDate" label="Tanggal Selesai" value={field.value} onChange={field.onChange} error={errors.endDate?.message} />} />
          </div>
          <div className="staff-day-count md:col-span-2 rounded-full bg-slate-50 px-4 py-3 text-sm text-slate-600" data-positive={totalDays > 0} aria-live="polite">
            Total hari kerja: <strong className="text-slate-900">{totalDays} hari</strong>
          </div>
          <div>
            <label className="form-label">Alasan</label>
            <textarea className="form-input min-h-40" {...register('reason')} placeholder="Jelaskan alasan pengajuan cuti" />
          </div>
          <div id="lampiran">
            <label className="form-label">
              Surat dokter / lampiran{' '}
              {attachmentRequired
                ? <span className="text-red-500">* Wajib</span>
                : <span className="text-slate-400">(Opsional)</span>}
            </label>
            <Controller name="file" control={control} rules={{ validate: (files) => !attachmentRequired || files?.length > 0 || 'Lampiran wajib untuk jenis cuti ini' }} render={({ field }) => <StaffFileDropzone value={field.value} onChange={field.onChange} required={attachmentRequired} error={errors.file?.message} />} />
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
