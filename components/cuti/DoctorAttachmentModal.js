'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import StaffFileDropzone from '@/components/ui/StaffFileDropzone'
import { validateStaffAttachment } from '@/lib/staff-file'

export default function DoctorAttachmentModal({ isOpen, onClose }) {
  const [files, setFiles] = useState(null)
  const [sickStartDate, setSickStartDate] = useState('')
  const [sickEndDate, setSickEndDate] = useState('')
  const [uploading, setUploading] = useState(false)

  const dismiss = () => {
    if (uploading) return
    setFiles(null)
    setSickStartDate('')
    setSickEndDate('')
    onClose()
  }

  const upload = async () => {
    const file = files?.[0]
    const validation = validateStaffAttachment(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }
    if (!file || !sickStartDate || !sickEndDate) {
      toast.error('Tanggal mulai dan selesai izin sakit wajib diisi sesuai surat dokter')
      return
    }
    if (sickEndDate < sickStartDate) {
      toast.error('Tanggal selesai tidak boleh sebelum tanggal mulai')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('purpose', 'doctor-certificate')
      formData.append('sickStartDate', sickStartDate)
      formData.append('sickEndDate', sickEndDate)
      const response = await fetch('/api/cuti/upload', { method: 'POST', body: formData })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal mengunggah surat dokter')
      setFiles(null)
      setSickStartDate('')
      setSickEndDate('')
      toast.success('Surat dokter berhasil diunggah dan dikirim ke admin')
      onClose()
    } catch (error) {
      toast.error(error.message || 'Gagal mengunggah surat dokter')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={dismiss}
      title="Upload Surat Dokter"
      size="md"
      footer={(
        <>
          <button type="button" onClick={dismiss} disabled={uploading} className="btn-secondary">Batal</button>
          <button type="button" onClick={upload} disabled={uploading || !files?.[0]} className="btn-primary">
            {uploading ? 'Mengunggah...' : 'Upload Surat Dokter'}
          </button>
        </>
      )}
    >
      <p className="mb-4 text-sm text-slate-600">Isi periode izin sakit persis seperti yang tercantum pada surat dokter, lalu pilih file surat. Format PDF, JPG, atau PNG, maksimal 5 MB.</p>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <label className="form-label" htmlFor="doctorSickStartDate">Tanggal mulai izin sakit <span className="text-red-500">*</span>
          <input id="doctorSickStartDate" name="sickStartDate" type="date" required className="form-input mt-1" value={sickStartDate} max={sickEndDate || undefined} onChange={(event) => setSickStartDate(event.target.value)} />
        </label>
        <label className="form-label" htmlFor="doctorSickEndDate">Tanggal selesai izin sakit <span className="text-red-500">*</span>
          <input id="doctorSickEndDate" name="sickEndDate" type="date" required className="form-input mt-1" value={sickEndDate} min={sickStartDate || undefined} onChange={(event) => setSickEndDate(event.target.value)} />
        </label>
      </div>
      <StaffFileDropzone value={files} onChange={setFiles} required />
    </Modal>
  )
}
