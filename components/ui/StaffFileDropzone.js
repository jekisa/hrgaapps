'use client'

import { useRef, useState } from 'react'
import { FileText, UploadCloud, X } from 'lucide-react'
import { formatStaffFileSize, validateStaffAttachment } from '@/lib/staff-file'

export default function StaffFileDropzone({ value, onChange, required, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const file = value?.[0]
  const setFiles = (files) => {
    const transfer = new DataTransfer()
    Array.from(files || []).slice(0, 1).forEach((item) => transfer.items.add(item))
    const selected = transfer.files
    const validation = validateStaffAttachment(selected[0])
    if (!validation.valid) { onChange(null); if (inputRef.current) inputRef.current.value = ''; return validation.error }
    onChange(selected.length ? selected : null)
    return null
  }
  const [localError, setLocalError] = useState(null)
  const selectFiles = (files) => setLocalError(setFiles(files))
  return <div><input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" tabIndex={-1} aria-label="Pilih surat dokter atau lampiran" aria-required={required} onChange={(event) => selectFiles(event.target.files)} /><div className="staff-dropzone rounded-xl p-4 text-center" data-dragging={dragging} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(event.dataTransfer.files) }}><button type="button" className="w-full rounded-lg p-3" onClick={() => inputRef.current?.click()}><UploadCloud className="mx-auto h-7 w-7 text-rose-600" /><span className="mt-2 block text-sm font-semibold text-slate-700">Seret file ke sini atau pilih file</span><span className="mt-1 block text-xs text-slate-500">PDF/JPG/PNG, maksimal 5 MB{required ? ' · Wajib' : ' · Opsional'}</span></button>{file && <div className="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 p-3 text-left"><FileText className="h-5 w-5 text-rose-700" /><span className="min-w-0 flex-1 truncate text-xs font-medium">{file.name} · {formatStaffFileSize(file.size)}</span><button type="button" aria-label="Hapus lampiran" onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}><X className="h-4 w-4" /></button></div>}</div>{(localError || error) && <p role="alert" className="mt-1 text-xs text-red-500">{localError || error}</p>}</div>
}
