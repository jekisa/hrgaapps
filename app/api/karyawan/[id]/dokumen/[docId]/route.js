import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import accessControl from '@/lib/access-control'
import dbConnect from '@/lib/db'
import DokumenKaryawan from '@/models/DokumenKaryawan'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'
import { unlink } from 'fs/promises'
import path from 'path'

const { requireRole } = accessControl

export async function DELETE(request, { params: paramsPromise }) {
  const params = await paramsPromise
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const accessError = requireRole(session, ['ADMIN'])
  if (accessError) return NextResponse.json({ error: accessError.error }, { status: accessError.status })

  try {
    await dbConnect()
    const dok = await DokumenKaryawan.findOne({ _id: params.docId, karyawanId: params.id })
    if (!dok) return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 })

    // Delete physical file
    if (dok.fileUrl) {
      const filePath = path.join(process.cwd(), 'public', dok.fileUrl)
      await unlink(filePath).catch(() => {}) // ignore if file already missing
    }

    await DokumenKaryawan.findByIdAndDelete(params.docId)

    await createAuditLog(
      session.user.id,
      'DELETE',
      'DOKUMEN_KARYAWAN',
      `Hapus dokumen: ${dok.namaFile || dok.jenisDokumen}`,
      getIpAddress(request)
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 })
  }
}
