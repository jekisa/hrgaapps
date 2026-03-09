import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Aset from '@/models/Aset'
import PeminjamanAset from '@/models/PeminjamanAset'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''

  await dbConnect()

  const query = status ? { status } : {}

  const [total, data] = await Promise.all([
    PeminjamanAset.countDocuments(query),
    PeminjamanAset.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('asetId', 'namaAset kodeAset kategori')
      .populate('karyawanId', 'nama nik jabatan'),
  ])

  const result = data.map((p) => {
    const pj = p.toJSON()
    pj.aset = pj.asetId
    pj.karyawan = pj.karyawanId
    delete pj.asetId
    delete pj.karyawanId
    return pj
  })

  return NextResponse.json({ data: result, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const aset = await Aset.findById(body.asetId)
    if (!aset) return NextResponse.json({ error: 'Aset tidak ditemukan' }, { status: 404 })
    if (aset.status !== 'AKTIF') {
      return NextResponse.json({ error: 'Aset tidak tersedia untuk dipinjam' }, { status: 400 })
    }

    const peminjaman = await PeminjamanAset.create({
      asetId: body.asetId,
      karyawanId: body.karyawanId,
      tanggalPinjam: new Date(body.tanggalPinjam),
      tanggalRencanaKembali: body.tanggalRencanaKembali ? new Date(body.tanggalRencanaKembali) : null,
      keperluan: body.keperluan || null,
      status: 'DIPINJAM',
    })

    await Aset.findByIdAndUpdate(body.asetId, { status: 'DIPINJAM' })

    await createAuditLog(session.user.id, 'CREATE', 'PEMINJAMAN_ASET', 'Tambah peminjaman aset', getIpAddress(request))
    return NextResponse.json(peminjaman, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal membuat peminjaman' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const peminjaman = await PeminjamanAset.findByIdAndUpdate(
      body.id,
      {
        status: 'DIKEMBALIKAN',
        tanggalKembali: new Date(),
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    if (!peminjaman) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await Aset.findByIdAndUpdate(peminjaman.asetId, { status: 'AKTIF' })

    await createAuditLog(session.user.id, 'UPDATE', 'PEMINJAMAN_ASET', 'Pengembalian aset', getIpAddress(request))
    return NextResponse.json(peminjaman)
  } catch {
    return NextResponse.json({ error: 'Gagal proses pengembalian' }, { status: 500 })
  }
}