import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import leaveStorage from '@/lib/leave-storage'

const { saveLeaveAttachment } = leaveStorage

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const formData = await request.formData()
    const file = formData.get('file')
    if (!file || typeof file.arrayBuffer !== 'function') return NextResponse.json({ error: 'File wajib dipilih' }, { status: 422 })
    return NextResponse.json(await saveLeaveAttachment(file, process.cwd()), { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Gagal upload lampiran' }, { status: error.status || 500 })
  }
}
