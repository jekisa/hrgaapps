import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Kendaraan from '@/models/Kendaraan'
import PembayaranPajak from '@/models/PembayaranPajak'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || ''

  await dbConnect()

  const query = status ? { status } : {}

  const data = await PembayaranPajak.find(query)
    .sort({ tanggalJatuhTempo: 1 })
    .populate('kendaraanId', 'noPol merk model')

  const result = data.map((d) => {
    const item = d.toJSON()
    item.kendaraan = item.kendaraanId
    delete item.kendaraanId
    return item
  })

  return NextResponse.json(result)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await PembayaranPajak.create({
      kendaraanId: body.kendaraanId,
      jenisPajak: body.jenisPajak,
      tahun: body.tahun ? parseInt(body.tahun) : null,
      tanggalJatuhTempo: body.tanggalJatuhTempo ? new Date(body.tanggalJatuhTempo) : null,
      jumlah: body.jumlah ? parseFloat(body.jumlah) : null,
      status: body.status || 'BELUM',
      keterangan: body.keterangan || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'PAJAK_KENDARAAN', 'Tambah pajak kendaraan', getIpAddress(request))
    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Gagal' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await PembayaranPajak.findByIdAndUpdate(
      body.id,
      {
        status: 'SUDAH',
        tanggalBayar: new Date(),
        jumlah: body.jumlah ? parseFloat(body.jumlah) : undefined,
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    if (!record) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    if (body.tanggalPajakBaruBerakhir) {
      await Kendaraan.findByIdAndUpdate(record.kendaraanId, {
        tanggalPajakBerakhir: new Date(body.tanggalPajakBaruBerakhir),
      })
    }

    await createAuditLog(session.user.id, 'UPDATE', 'PAJAK_KENDARAAN', 'Bayar pajak kendaraan', getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal bayar pajak' }, { status: 500 })
  }
}