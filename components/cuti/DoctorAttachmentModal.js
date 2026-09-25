'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from '@/components/ui/Modal'
import StaffFileDropzone from '@/components/ui/StaffFileDropzone'
import { validateStaffAttachment } from '@/lib/staff-file'

export default function DoctorAttachmentModal({ isOpen, onClose }) {
  const [files, setFiles] = useState(null)
  const [uploading, setUploading] = useState(false)

  const dismiss = () => {
    if (uploading) return
    setFiles(null)
    onClose()
  }

  const upload = async () => {
    const file = files?.[0]
    const validation = validateStaffAttachment(file)
    if (!validation.valid) {
      toast.error(validation.error)
      return
    }
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/cuti/upload', { method: 'POST', body: formData })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'Gagal mengunggah surat dokter')
      setFiles(null)
      toast.success('Surat dokter berhasil diunggah')
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
      <p className="mb-4 text-sm text-slate-600">Pilih file surat dokter untuk diunggah. Format PDF, JPG, atau PNG, maksimal 5 MB.</p>
      <StaffFileDropzone value={files} onChange={setFiles} required />
    </Modal>
  )
}
