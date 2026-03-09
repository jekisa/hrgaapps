import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import RiwayatJabatan from '@/models/RiwayatJabatan'
import Notifikasi from '@/models/Notifikasi'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const departemen = searchParams.get('departemen') || ''

  await dbConnect()

  const query = {}
  if (search) {
    query.$or = [
      { nama: { $regex: search, $options: 'i' } },
      { nik: { $regex: search, $options: 'i' } },
      { jabatan: { $regex: search, $options: 'i' } },
      { departemen: { $regex: search, $options: 'i' } },
    ]
  }
  if (status) query.statusKontrak = status
  if (departemen) query.departemen = departemen

  const [total, data] = await Promise.all([
    Karyawan.countDocuments(query),
    Karyawan.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('nik nama jabatan departemen statusKontrak tanggalMasuk tanggalKontrakBerakhir statusAktif telepon email foto tanggalLahir'),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const existing = await Karyawan.findOne({ nik: body.nik })
    if (existing) {
      return NextResponse.json({ error: 'NIK sudah terdaftar' }, { status: 400 })
    }

    const karyawan = await Karyawan.create({
      nik: body.nik,
      nama: body.nama,
      tempatLahir: body.tempatLahir || null,
      tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
      jenisKelamin: body.jenisKelamin || null,
      agama: body.agama || null,
      alamat: body.alamat || null,
      telepon: body.telepon || null,
      email: body.email || null,
      statusKontrak: body.statusKontrak || 'PKWTT',
      tanggalMasuk: body.tanggalMasuk ? new Date(body.tanggalMasuk) : null,
      tanggalKontrakBerakhir: body.tanggalKontrakBerakhir ? new Date(body.tanggalKontrakBerakhir) : null,
      departemen: body.departemen || null,
      jabatan: body.jabatan || null,
    })

    if (body.jabatan && body.tanggalMasuk) {
      await RiwayatJabatan.create({
        karyawanId: karyawan._id,
        jabatan: body.jabatan,
        departemen: body.departemen || null,
        tanggalMulai: new Date(body.tanggalMasuk),
        keterangan: 'Penempatan awal',
      })
    }

    if (body.statusKontrak === 'PKWT' && body.tanggalKontrakBerakhir) {
      await Notifikasi.create({
        judul: 'Karyawan PKWT Ditambahkan',
        pesan: `Karyawan ${body.nama} dengan status PKWT, kontrak berakhir ${new Date(body.tanggalKontrakBerakhir).toLocaleDateString('id-ID')}`,
        tipe: 'KONTRAK',
        targetId: karyawan._id,
      })
    }

    await createAuditLog(session.user.id, 'CREATE', 'KARYAWAN', `Menambah karyawan: ${body.nama} (${body.nik})`, getIpAddress(request))
    return NextResponse.json(karyawan, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menambah karyawan' }, { status: 500 })
  }
}
