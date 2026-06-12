import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { addMonths, addYears } from 'date-fns'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Reminder from '@/models/Reminder'
import { createAuditLog, getIpAddress } from '@/lib/server-utils'

const nextDueDate = (date, recurrence) => {
  if (recurrence === 'MONTHLY') return addMonths(date, 1)
  if (recurrence === 'QUARTERLY') return addMonths(date, 3)
  if (recurrence === 'YEARLY') return addYears(date, 1)
  return date
}

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'ACTIVE'
  const kategori = searchParams.get('kategori') || ''

  await dbConnect()

  const query = {}
  if (status) query.status = status
  if (kategori) query.kategori = kategori

  const data = await Reminder.find(query).sort({ tanggalJatuhTempo: 1, prioritas: -1 })
  return NextResponse.json({ data })
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const reminder = await Reminder.create({
      judul: body.judul,
      kategori: body.kategori,
      tanggalJatuhTempo: new Date(body.tanggalJatuhTempo),
      jumlah: body.jumlah ? parseFloat(body.jumlah) : null,
      prioritas: body.prioritas || 'NORMAL',
      recurrence: body.recurrence || 'NONE',
      catatan: body.catatan || null,
    })

    await createAuditLog(session.user.id, 'CREATE', 'REMINDER', `Tambah reminder: ${body.judul}`, getIpAddress(request))
    return NextResponse.json(reminder, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan reminder' }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    await dbConnect()

    const reminder = await Reminder.findById(body.id)
    if (!reminder) return NextResponse.json({ error: 'Reminder tidak ditemukan' }, { status: 404 })

    if (body.action === 'DONE') {
      const now = new Date()
      if (reminder.recurrence && reminder.recurrence !== 'NONE') {
        reminder.lastCompletedAt = now
        reminder.completedAt = null
        reminder.status = 'ACTIVE'
        reminder.tanggalJatuhTempo = nextDueDate(reminder.tanggalJatuhTempo, reminder.recurrence)
      } else {
        reminder.status = 'DONE'
        reminder.completedAt = now
        reminder.lastCompletedAt = now
      }
      await reminder.save()
      await createAuditLog(session.user.id, 'UPDATE', 'REMINDER', `Selesaikan reminder: ${reminder.judul}`, getIpAddress(request))
      return NextResponse.json(reminder)
    }

    const update = {
      judul: body.judul,
      kategori: body.kategori,
      tanggalJatuhTempo: body.tanggalJatuhTempo ? new Date(body.tanggalJatuhTempo) : reminder.tanggalJatuhTempo,
      jumlah: body.jumlah ? parseFloat(body.jumlah) : null,
      prioritas: body.prioritas || 'NORMAL',
      status: body.status || reminder.status,
      recurrence: body.recurrence || 'NONE',
      catatan: body.catatan || null,
    }

    const updated = await Reminder.findByIdAndUpdate(body.id, update, { new: true })
    await createAuditLog(session.user.id, 'UPDATE', 'REMINDER', `Update reminder: ${updated.judul}`, getIpAddress(request))
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal update reminder' }, { status: 500 })
  }
}

export async function DELETE(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID wajib diisi' }, { status: 400 })

  await dbConnect()
  const reminder = await Reminder.findByIdAndDelete(id)
  if (!reminder) return NextResponse.json({ error: 'Reminder tidak ditemukan' }, { status: 404 })

  await createAuditLog(session.user.id, 'DELETE', 'REMINDER', `Hapus reminder: ${reminder.judul}`, getIpAddress(request))
  return NextResponse.json({ success: true })
}
