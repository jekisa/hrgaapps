import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const record = await MaintenanceRequest.findByIdAndUpdate(
      params.id,
      {
        judul: body.judul,
        lokasi: body.lokasi || null,
        kategori: body.kategori || null,
        deskripsi: body.deskripsi || null,
        prioritas: body.prioritas,
        status: body.status,
        pelaksana: body.pelaksana || null,
        biaya: body.biaya ? parseFloat(body.biaya) : null,
        tanggalSelesai: body.status === 'SELESAI' ? new Date() : null,
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    if (!record) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await createAuditLog(session.user.id, 'UPDATE', 'MAINTENANCE', 'Update maintenance request', getIpAddress(request))
    return NextResponse.json(record)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await dbConnect()
    await MaintenanceRequest.findByIdAndDelete(params.id)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus' }, { status: 500 })
  }
}