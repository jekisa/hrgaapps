'use client'

import { useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, MapPin, Briefcase, FileText,
  ArrowLeft, Edit, Upload, Trash2, X, Plus
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import KaryawanModal from '@/components/karyawan/KaryawanModal'

export default function KaryawanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState('biodata')
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    jenisDokumen: '', noDokumen: '', tanggalTerbit: '', tanggalBerakhir: '', keterangan: '',
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const { data, isLoading } = useQuery({
    queryKey: ['karyawan-detail', id],
    queryFn: async () => {
      const res = await fetch(`/api/karyawan/${id}`)
      if (!res.ok) { toast.error('Data tidak ditemukan'); router.push('/karyawan'); return null }
      return res.json()
    },
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded-xl" />
        <div className="h-12 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-xl" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) return null

  async function handleUpload(e) {
    e.preventDefault()
    if (!selectedFile) return toast.error('Pilih file terlebih dahulu')
    if (!uploadForm.jenisDokumen.trim()) return toast.error('Jenis dokumen wajib diisi')

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', selectedFile)
      fd.append('jenisDokumen', uploadForm.jenisDokumen)
      fd.append('noDokumen', uploadForm.noDokumen)
      fd.append('tanggalTerbit', uploadForm.tanggalTerbit)
      fd.append('tanggalBerakhir', uploadForm.tanggalBerakhir)
      fd.append('keterangan', uploadForm.keterangan)

      const res = await fetch(`/api/karyawan/${id}/dokumen`, { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Gagal upload')
      }
      toast.success('Dokumen berhasil diupload')
      setShowUpload(false)
      setSelectedFile(null)
      setUploadForm({ jenisDokumen: '', noDokumen: '', tanggalTerbit: '', tanggalBerakhir: '', keterangan: '' })
      queryClient.invalidateQueries({ queryKey: ['karyawan-detail', id] })
    } catch (err) {
      toast.error(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDeleteDokumen(docId, namaFile) {
    if (!confirm(`Hapus dokumen "${namaFile}"?`)) return
    try {
      const res = await fetch(`/api/karyawan/${id}/dokumen/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      toast.success('Dokumen dihapus')
      queryClient.invalidateQueries({ queryKey: ['karyawan-detail', id] })
    } catch {
      toast.error('Gagal menghapus dokumen')
    }
  }

  const tabs = [
    { id: 'biodata', label: 'Biodata' },
    { id: 'riwayat', label: `Riwayat Jabatan (${data.riwayatJabatan?.length || 0})` },
    { id: 'dokumen', label: `Dokumen (${data.dokumen?.length || 0})` },
    { id: 'aset', label: `Aset Dipinjam (${data.peminjaman?.length || 0})` },
  ]

  return (
    <div>
      <PageHeader
        title={data.nama}
        subtitle={`${data.jabatan || ''} ${data.departemen ? '• ' + data.departemen : ''}`}
        breadcrumb={[
          { label: 'Dashboard', href: '/' },
          { label: 'Karyawan', href: '/karyawan' },
          { label: data.nama },
        ]}
        actions={
          <>
            <Link href="/karyawan" className="btn-secondary">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Link>
            <button onClick={() => setShowEdit(true)} className="btn-primary">
              <Edit className="w-4 h-4" /> Edit
            </button>
          </>
        }
      />

      {/* Info Bar */}
      <div className="card p-4 mb-4 flex flex-wrap items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 text-xl font-bold shrink-0">
          {data.nama.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge status={data.statusKontrak} />
            <Badge
              status={data.statusAktif ? 'AKTIF' : 'TIDAK_AKTIF'}
              label={data.statusAktif ? 'Aktif' : 'Non-Aktif'}
            />
            <span className="text-xs text-gray-500">NIK: <span className="font-mono">{data.nik}</span></span>
          </div>
          {data.tanggalKontrakBerakhir && (
            <p className="text-xs text-orange-600 mt-1 font-medium">
              Kontrak berakhir: {formatDate(data.tanggalKontrakBerakhir)}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'biodata' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Data Pribadi
            </h3>
            <dl className="space-y-3">
              {[
                ['Nama Lengkap', data.nama],
                ['NIK', data.nik],
                ['Tempat Lahir', data.tempatLahir],
                ['Tanggal Lahir', formatDate(data.tanggalLahir)],
                ['Jenis Kelamin', data.jenisKelamin === 'L' ? 'Laki-laki' : data.jenisKelamin === 'P' ? 'Perempuan' : '-'],
                ['Agama', data.agama],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <dt className="text-sm text-gray-500 w-36 shrink-0">{label}</dt>
                  <dd className="text-sm text-gray-800 font-medium">{value || '-'}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> Data Kepegawaian
            </h3>
            <dl className="space-y-3">
              {[
                ['Jabatan', data.jabatan],
                ['Departemen', data.departemen],
                ['Status Kontrak', data.statusKontrak],
                ['Tanggal Masuk', formatDate(data.tanggalMasuk)],
                ['Kontrak Berakhir', formatDate(data.tanggalKontrakBerakhir)],
                ['Telepon', data.telepon],
                ['Email', data.email],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-4">
                  <dt className="text-sm text-gray-500 w-36 shrink-0">{label}</dt>
                  <dd className="text-sm text-gray-800 font-medium">{value || '-'}</dd>
                </div>
              ))}
            </dl>
          </div>
          {data.alamat && (
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Alamat
              </h3>
              <p className="text-sm text-gray-700">{data.alamat}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'riwayat' && (
        <div className="card overflow-hidden">
          {data.riwayatJabatan.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Belum ada riwayat jabatan</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {data.riwayatJabatan.map((rj, idx) => (
                <div key={rj.id} className="p-4 flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${idx === 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    {idx < data.riwayatJabatan.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200 mt-1" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{rj.jabatan}</p>
                    <p className="text-sm text-gray-500">{rj.departemen}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(rj.tanggalMulai)} — {rj.tanggalSelesai ? formatDate(rj.tanggalSelesai) : 'Sekarang'}
                    </p>
                    {rj.keterangan && <p className="text-xs text-gray-500 mt-1">{rj.keterangan}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'dokumen' && (
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{data.dokumen.length} dokumen tersimpan</p>
            <button
              onClick={() => setShowUpload(true)}
              className="btn-primary text-sm"
            >
              <Plus className="w-4 h-4" /> Upload Dokumen
            </button>
          </div>
          {data.dokumen.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada dokumen</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.dokumen.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.namaFile || doc.jenisDokumen}</p>
                      <p className="text-xs text-gray-500 truncate">{doc.jenisDokumen}</p>
                      <p className="text-xs text-gray-400">{formatDate(doc.createdAt)}</p>
                    </div>
                  </a>
                  <button
                    onClick={() => handleDeleteDokumen(doc.id, doc.namaFile || doc.jenisDokumen)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    title="Hapus dokumen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !uploading && setShowUpload(false)}
          />

          {/* Sheet */}
          <div className="relative w-full sm:max-w-lg sm:mx-4 bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* Gradient Header */}
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-600 to-primary-800 px-6 pt-5 pb-10 shrink-0">
              {/* decorative circles */}
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full" />
              <div className="absolute top-2 right-10 w-12 h-12 bg-white/10 rounded-full" />

              <div className="relative flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">Upload Dokumen</h2>
                    <p className="text-primary-200 text-xs mt-0.5">Tambahkan file dokumen karyawan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !uploading && setShowUpload(false)}
                  className="w-8 h-8 bg-white/15 hover:bg-white/30 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-all duration-150 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* White card pulled up over gradient */}
            <div className="-mt-5 bg-white rounded-t-3xl relative z-10 flex-1 overflow-y-auto">
              <form onSubmit={handleUpload} className="p-5 space-y-4">

                {/* ── Drop Zone ── */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const f = e.dataTransfer.files?.[0]
                    if (f) setSelectedFile(f)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                    isDragging
                      ? 'border-primary-400 bg-primary-50 scale-[1.01]'
                      : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/60'
                      : 'border-gray-200 bg-gray-50/80 hover:border-primary-300 hover:bg-primary-50/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />

                  {selectedFile ? (
                    <div className="p-4 flex items-center gap-3">
                      {/* File type colour */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        /\.(jpg|jpeg|png)$/i.test(selectedFile.name) ? 'bg-violet-100' :
                        /\.pdf$/i.test(selectedFile.name) ? 'bg-red-100' :
                        /\.(doc|docx)$/i.test(selectedFile.name) ? 'bg-blue-100' :
                        'bg-emerald-100'
                      }`}>
                        <FileText className={`w-5 h-5 ${
                          /\.(jpg|jpeg|png)$/i.test(selectedFile.name) ? 'text-violet-600' :
                          /\.pdf$/i.test(selectedFile.name) ? 'text-red-600' :
                          /\.(doc|docx)$/i.test(selectedFile.name) ? 'text-blue-600' :
                          'text-emerald-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {selectedFile.size < 1024 * 1024
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                          }
                          {' '}· klik untuk ganti
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                        className="w-7 h-7 bg-white hover:bg-red-50 hover:text-red-500 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 transition-colors shrink-0 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center gap-3">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        isDragging ? 'bg-primary-100 scale-110 rotate-3' : 'bg-gray-100'
                      }`}>
                        <Upload className={`w-6 h-6 transition-colors ${isDragging ? 'text-primary-600' : 'text-gray-400'}`} />
                      </div>
                      <div className="text-center px-4">
                        <p className="text-sm font-semibold text-gray-700">
                          {isDragging ? 'Lepaskan file di sini' : 'Drag & drop atau klik untuk pilih file'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, JPG, PNG, XLSX · maks 10 MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Jenis Dokumen + chips ── */}
                <div>
                  <label className="form-label">
                    Jenis Dokumen <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {['KTP', 'NPWP', 'Ijazah', 'Kontrak Kerja', 'SIM', 'BPJS', 'Sertifikat'].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => setUploadForm((p) => ({ ...p, jenisDokumen: chip }))}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-150 ${
                          uploadForm.jenisDokumen === chip
                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                            : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50'
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Atau ketik jenis dokumen lainnya…"
                    value={uploadForm.jenisDokumen}
                    onChange={(e) => setUploadForm((p) => ({ ...p, jenisDokumen: e.target.value }))}
                  />
                </div>

                {/* ── Nomor Dokumen ── */}
                <div>
                  <label className="form-label">Nomor Dokumen <span className="text-gray-400 font-normal text-xs">(opsional)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nomor / ID dokumen"
                    value={uploadForm.noDokumen}
                    onChange={(e) => setUploadForm((p) => ({ ...p, noDokumen: e.target.value }))}
                  />
                </div>

                {/* ── Dates ── */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label">Tanggal Terbit</label>
                    <input
                      type="date"
                      className="form-input"
                      value={uploadForm.tanggalTerbit}
                      onChange={(e) => setUploadForm((p) => ({ ...p, tanggalTerbit: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Tanggal Berakhir</label>
                    <input
                      type="date"
                      className="form-input"
                      value={uploadForm.tanggalBerakhir}
                      onChange={(e) => setUploadForm((p) => ({ ...p, tanggalBerakhir: e.target.value }))}
                    />
                  </div>
                </div>

                {/* ── Keterangan ── */}
                <div>
                  <label className="form-label">Keterangan <span className="text-gray-400 font-normal text-xs">(opsional)</span></label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Catatan tambahan…"
                    value={uploadForm.keterangan}
                    onChange={(e) => setUploadForm((p) => ({ ...p, keterangan: e.target.value }))}
                  />
                </div>

                {/* ── Actions ── */}
                <div className="flex gap-3 pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => setShowUpload(false)}
                    disabled={uploading}
                    className="btn-secondary flex-1 justify-center"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary flex-1 justify-center"
                  >
                    {uploading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Mengupload…
                      </>
                    ) : (
                      <><Upload className="w-4 h-4" /> Upload Dokumen</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'aset' && (
        <div className="card overflow-hidden">
          {data.peminjaman.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Tidak ada aset yang sedang dipinjam</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Kode Aset</th>
                  <th className="table-th">Nama Aset</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.peminjaman.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="table-td font-mono text-xs">{p.aset.kodeAset}</td>
                    <td className="table-td">{p.aset.namaAset}</td>
                    <td className="table-td"><Badge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <KaryawanModal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={() => {
          setShowEdit(false)
          queryClient.invalidateQueries({ queryKey: ['karyawan-detail', id] })
        }}
        editData={data}
      />
    </div>
  )
}
