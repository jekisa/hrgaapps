import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import RiwayatJabatan from '@/models/RiwayatJabatan'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await dbConnect()

  const data = await RiwayatJabatan.find()
    .sort({ tanggalMulai: -1 })
    .populate('karyawanId', 'nama nik')

  const result = data.map((r) => {
    const item = r.toJSON()
    item.karyawan = item.karyawanId
    delete item.karyawanId
    return item
  })

  return NextResponse.json(result)
}