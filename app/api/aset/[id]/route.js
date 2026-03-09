import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Aset from '@/models/Aset'
import PeminjamanAset from '@/models/PeminjamanAset'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const aset = await Aset.findById(params.id)
  if (!aset) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

  const peminjaman = await PeminjamanAset.find({ asetId: params.id })
    .sort({ createdAt: -1 })
    .populate('karyawanId', 'nama nik')

  const result = aset.toJSON()
  result.peminjaman = peminjaman.map((p) => {
    const pj = p.toJSON()
    pj.karyawan = pj.karyawanId
    delete pj.karyawanId
    return pj
  })

  return NextResponse.json(result)
}

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const aset = await Aset.findByIdAndUpdate(
      params.id,
      {
        namaAset: body.namaAset,
        kategori: body.kategori,
        merk: body.merk || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,
        nilaiPerolehan: body.nilaiPerolehan ? parseFloat(body.nilaiPerolehan) : null,
        kondisi: body.kondisi,
        status: body.status,
        lokasi: body.lokasi || null,
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    if (!aset) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await createAuditLog(session.user.id, 'UPDATE', 'ASET', 'Update aset', getIpAddress(request))
    return NextResponse.json(aset)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update aset' }, { status: 500 })
  }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  try {
    await dbConnect()
    const aset = await Aset.findById(params.id)
    if (!aset) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await Aset.findByIdAndDelete(params.id)
    await createAuditLog(session.user.id, 'DELETE', 'ASET', 'Hapus aset', getIpAddress(request))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus aset' }, { status: 500 })
  }
}