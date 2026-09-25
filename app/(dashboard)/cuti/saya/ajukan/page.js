'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { AlertTriangle, UploadCloud } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import leaveUtils from '@/lib/leave-utils'
import leaveForm from '@/lib/leave-form'
import { useRouter } from 'next/navigation'

const { countBusinessDays } = leaveUtils
const { getQuotaWarning, buildLeaveSubmission } = leaveForm

async function fetchJson(url, options) { const response = await fetch(url, options); const payload = await response.json(); if (!response.ok) throw new Error(payload.error || 'Gagal memproses pengajuan'); return payload }

export default function AjukanCutiPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm()
  const { data: typeData } = useQuery({ queryKey: ['cuti', 'jenis'], queryFn: () => fetchJson('/api/cuti/jenis') })
  const { data: balanceData } = useQuery({ queryKey: ['cuti', 'saldo', 'me'], queryFn: () => fetchJson('/api/cuti/saldo') })
  const leaveTypeId = watch('leaveTypeId')
  const startDate = watch('startDate')
  const endDate = watch('endDate')
  const selectedType = useMemo(() => (typeData?.data || []).find((item) => item._id === leaveTypeId), [typeData, leaveTypeId])
  const selectedBalance = (balanceData?.data || []).find((item) => item.leaveType?._id === leaveTypeId || item.leaveTypeId === leaveTypeId)
  let totalDays = 0
  try { if (startDate && endDate) totalDays = countBusinessDays(startDate, endDate) } catch { totalDays = 0 }
  const quotaWarning = getQuotaWarning(selectedBalance?.sisa || 0, totalDays)
  const onSubmit = async (data) => {
    try {
      if (!selectedType) throw new Error('Pilih jenis cuti')
      if (selectedType.requiresAttachment && !data.file?.[0]) throw new Error('Lampiran wajib untuk jenis cuti ini')
      let attachmentUrl = null
      if (data.file?.[0]) { const formData = new FormData(); formData.append('file', data.file[0]); const upload = await fetchJson('/api/cuti/upload', { method: 'POST', body: formData }); attachmentUrl = upload.attachmentUrl }
      await fetchJson('/api/cuti/pengajuan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildLeaveSubmission({ ...data, attachmentUrl })) })
      toast.success('Pengajuan cuti berhasil dikirim'); reset(); queryClient.invalidateQueries({ queryKey: ['cuti'] }); router.push('/cuti/saya/riwayat')
    } catch (error) { toast.error(error.message) }
  }
  return <div><PageHeader title="Ajukan Cuti" subtitle="Kirim pengajuan cuti untuk direview admin" breadcrumb={[{ label: 'Dashboard', href: '/' }, { label: 'Cuti Saya', href: '/cuti/saya' }, { label: 'Ajukan Cuti' }]} /><form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><div className="md:col-span-2"><label className="form-label">Jenis Cuti <span className="text-red-500">*</span></label><select className="form-select" {...register('leaveTypeId', { required: 'Jenis cuti wajib dipilih' })}><option value="">Pilih jenis cuti</option>{(typeData?.data || []).map((item) => <option key={item._id} value={item._id}>{item.name} · kuota {item.defaultQuotaPerYear} hari</option>)}</select>{errors.leaveTypeId && <p className="mt-1 text-xs text-red-500">{errors.leaveTypeId.message}</p>}</div><div><label className="form-label">Tanggal Mulai <span className="text-red-500">*</span></label><input type="date" className="form-input" {...register('startDate', { required: 'Tanggal mulai wajib diisi' })} />{errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}</div><div><label className="form-label">Tanggal Selesai <span className="text-red-500">*</span></label><input type="date" className="form-input" {...register('endDate', { required: 'Tanggal selesai wajib diisi' })} />{errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}</div><div className="md:col-span-2"><div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Total hari kerja: <strong className="text-slate-900">{totalDays} hari</strong>{selectedBalance && <span className="ml-3">Sisa kuota: <strong className="text-slate-900">{selectedBalance.sisa} hari</strong></span>}</div>{quotaWarning && <p className="mt-2 flex items-center gap-2 text-xs font-semibold text-red-600"><AlertTriangle className="h-3.5 w-3.5" />{quotaWarning}; pengajuan tetap dapat dikirim untuk review admin.</p>}</div><div className="md:col-span-2"><label className="form-label">Alasan</label><textarea className="form-input min-h-28" {...register('reason')} placeholder="Jelaskan alasan pengajuan cuti" /></div><div className="md:col-span-2"><label className="form-label">Lampiran {selectedType?.requiresAttachment && <span className="text-red-500">*</span>}</label><div className="rounded-xl border border-dashed border-slate-300 p-4"><input type="file" accept=".pdf,.jpg,.jpeg,.png" {...register('file')} /><p className="mt-2 flex items-center gap-1 text-xs text-slate-400"><UploadCloud className="h-3.5 w-3.5" />PDF/JPG/PNG, maksimal 5 MB</p></div></div></div><div className="mt-5 flex justify-end"><button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button></div></form></div>
}
