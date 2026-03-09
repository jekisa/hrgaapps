import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import RiwayatJabatan from '@/models/RiwayatJabatan'
import DokumenKaryawan from '@/models/DokumenKaryawan'
import PeminjamanAset from '@/models/PeminjamanAset'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const karyawan = await Karyawan.findById(params.id)
  if (!karyawan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const [riwayatJabatan, dokumen, peminjaman] = await Promise.all([
    RiwayatJabatan.find({ karyawanId: params.id }).sort({ tanggalMulai: -1 }),
    DokumenKaryawan.find({ karyawanId: params.id }).sort({ createdAt: -1 }),
    PeminjamanAset.find({ karyawanId: params.id, status: 'DIPINJAM' })
      .populate('asetId', 'namaAset kodeAset'),
  ])

  const result = karyawan.toJSON()
  result.riwayatJabatan = riwayatJabatan.map((r) => r.toJSON())
  result.dokumen = dokumen.map((d) => d.toJSON())
  result.peminjaman = peminjaman.map((p) => {
    const pj = p.toJSON()
    pj.aset = pj.asetId
    delete pj.asetId
    return pj
  })

  return NextResponse.json(result)
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    if (body.nik) {
      const existing = await Karyawan.findOne({ nik: body.nik, _id: { $ne: params.id } })
      if (existing) return NextResponse.json({ error: 'NIK sudah digunakan' }, { status: 400 })
    }

    const karyawan = await Karyawan.findByIdAndUpdate(
      params.id,
      {
        nik: body.nik,
        nama: body.nama,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: body.jenisKelamin || null,
        agama: body.agama || null,
        alamat: body.alamat || null,
        telepon: body.telepon || null,
        email: body.email || null,
        statusKontrak: body.statusKontrak,
        tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : null,
        tanggalKontrakBerakhir: body.tanggalKontrakBerakhir ? new Date(body.tanggalKontrakBerakhir) : null,
        departemen: body.departemen || null,
        jabatan: body.jabatan || null,
        statusAktif: body.statusAktif !== undefined ? body.statusAktif : true,
      },
      { new: true }
    )

    if (!karyawan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await createAuditLog(session.user.id, 'UPDATE', 'KARYAWAN', `Update karyawan: ${body.nama}`, getIpAddress(request))
    return NextResponse.json(karyawan)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update karyawan' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await dbConnect()
    const karyawan = await Karyawan.findById(params.id)
    if (!karyawan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await Karyawan.findByIdAndDelete(params.id)

    await createAuditLog(session.user.id, 'DELETE', 'KARYAWAN', `Hapus karyawan: ${karyawan.nama}`, getIpAddress(request))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghapus karyawan' }, { status: 500 })
  }
}