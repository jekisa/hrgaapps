import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import DokumenKaryawan from '@/models/DokumenKaryawan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const jenisDokumen = formData.get('jenisDokumen')
    const noDokumen = formData.get('noDokumen') || null
    const tanggalTerbit = formData.get('tanggalTerbit') || null
    const tanggalBerakhir = formData.get('tanggalBerakhir') || null
    const keterangan = formData.get('keterangan') || null

    if (!file || !jenisDokumen) {
      return NextResponse.json({ error: 'File dan jenis dokumen wajib diisi' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'dokumen', params.id)
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    await writeFile(path.join(uploadDir, safeName), buffer)

    const fileUrl = `/uploads/dokumen/${params.id}/${safeName}`

    await dbConnect()
    const dok = await DokumenKaryawan.create({
      karyawanId: params.id,
      jenisDokumen,
      noDokumen,
      tanggalTerbit: tanggalTerbit ? new Date(tanggalTerbit) : null,
      tanggalBerakhir: tanggalBerakhir ? new Date(tanggalBerakhir) : null,
      namaFile: file.name,
      tipeFile: file.type,
      fileUrl,
      keterangan,
    })

    await createAuditLog(
      session.user.id,
      'CREATE',
      'DOKUMEN_KARYAWAN',
      `Upload dokumen: ${file.name}`,
      getIpAddress(request)
    )

    return NextResponse.json(dok.toJSON(), { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal upload dokumen' }, { status: 500 })
  }
}
