import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import accessControl from '@/lib/access-control'
import dbConnect from '@/lib/db'
import Kendaraan from '@/models/Kendaraan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

const { requireRole } = accessControl

export async function PUT(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessError = requireRole(session, ['ADMIN'])
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  try {
    const body = await request.json()
    await dbConnect()

    const kendaraan = await Kendaraan.findByIdAndUpdate(
      params.id,
      {
        merk: body.merk,
        model: body.model || null,
        tahun: body.tahun ? parseInt(body.tahun) : null,
        warna: body.warna || null,
        jenisKendaraan: body.jenisKendaraan || null,
        noRangka: body.noRangka || null,
        noMesin: body.noMesin || null,
        status: body.status,
        tanggalPajakBerakhir: body.tanggalPajakBerakhir ? new Date(body.tanggalPajakBerakhir) : null,
        tanggalSTNKBerakhir: body.tanggalSTNKBerakhir ? new Date(body.tanggalSTNKBerakhir) : null,
        keterangan: body.keterangan || null,
      },
      { new: true }
    )

    if (!kendaraan) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    await createAuditLog(session.user.id, 'UPDATE', 'KENDARAAN', 'Update kendaraan', getIpAddress(request))
    return NextResponse.json(kendaraan)
  } catch {
    return NextResponse.json({ error: 'Gagal update' }, { status: 500 })
  }
}

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessError = requireRole(session, ['ADMIN'])
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  try {
    await dbConnect()
    await Kendaraan.findByIdAndDelete(params.id)
    await createAuditLog(session.user.id, 'DELETE', 'KENDARAAN', 'Hapus kendaraan', getIpAddress(request))
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal hapus' }, { status: 500 })
  }
}
