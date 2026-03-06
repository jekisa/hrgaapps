'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User, Phone, Mail, MapPin, Calendar, Briefcase, FileText,
  ArrowLeft, Edit, Clock, Package
} from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { PageLoader } from '@/components/ui/LoadingSpinner'
import { formatDate, formatCurrency } from '@/lib/utils'
import KaryawanModal from '@/components/karyawan/KaryawanModal'

export default function KaryawanDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [activeTab, setActiveTab] = useState('biodata')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/karyawan/${id}`)
      if (!res.ok) { toast.error('Data tidak ditemukan'); router.push('/karyawan'); return }
      setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [id, router])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <PageLoader />
  if (!data) return null

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
          {data.dokumen.length === 0 ? (
            <div className="py-8 text-center text-gray-400">Belum ada dokumen</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.dokumen.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.urlFile}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-8 h-8 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{doc.namaFile}</p>
                    <p className="text-xs text-gray-400">{doc.tipeFile} • {formatDate(doc.createdAt)}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
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
        onSaved={() => { setShowEdit(false); fetchData() }}
        editData={data}
      />
    </div>
  )
}
