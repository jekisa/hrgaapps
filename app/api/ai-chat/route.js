import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Anthropic from '@anthropic-ai/sdk'
import dbConnect from '@/lib/db'
import Karyawan from '@/models/Karyawan'
import Aset from '@/models/Aset'
import Kendaraan from '@/models/Kendaraan'
import MaintenanceRequest from '@/models/MaintenanceRequest'
import PembayaranPajak from '@/models/PembayaranPajak'
import JadwalKendaraan from '@/models/JadwalKendaraan'
import PerawatanKendaraan from '@/models/PerawatanKendaraan'
import PeminjamanAset from '@/models/PeminjamanAset'
import { addDays } from 'date-fns'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are an AI assistant embedded in HRGA Apps — a Human Resources & General Affairs management system for an Indonesian company.
Your job is to help HR and GA staff quickly understand data about employees (karyawan), assets (aset), vehicles (kendaraan), and buildings/facilities (gedung).
Always use the available tools to fetch up-to-date data before answering. Never guess numbers.
Respond in the same language the user writes in (Indonesian or English).
Format responses clearly: use bullet points, bold numbers, and short summaries. Keep answers concise but complete.`

const tools = [
  {
    name: 'get_dashboard_stats',
    description: 'Get overall statistics: total employees, active employees, contracts expiring soon, total assets, borrowed assets, pending maintenance, total vehicles, available vehicles, upcoming tax due dates.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'get_karyawan_data',
    description: 'Get employee (karyawan) data. Can filter by status. Returns employee list and breakdown by contract type (PKWTT, PKWT, PROBATION).',
    input_schema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'active', 'inactive', 'expiring_soon'],
          description: 'Filter employees: all, active only, inactive only, or contracts expiring within 30 days',
        },
        limit: { type: 'integer', description: 'Max number of employees to return (default: 15)' },
      },
      required: [],
    },
  },
  {
    name: 'get_aset_data',
    description: 'Get asset (aset) inventory data. Returns asset list and breakdown by category. Can filter by availability.',
    input_schema: {
      type: 'object',
      properties: {
        filter: {
          type: 'string',
          enum: ['all', 'available', 'borrowed', 'maintenance'],
          description: 'Filter assets by status',
        },
        limit: { type: 'integer', description: 'Max number of assets to return (default: 15)' },
      },
      required: [],
    },
  },
  {
    name: 'get_kendaraan_data',
    description: 'Get vehicle (kendaraan) data including vehicle list, upcoming schedules (jadwal), maintenance records (perawatan), and tax payments (pajak) due soon.',
    input_schema: {
      type: 'object',
      properties: {
        include: {
          type: 'string',
          enum: ['list', 'jadwal', 'perawatan', 'pajak', 'all'],
          description: 'What data to include (default: all)',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_gedung_data',
    description: 'Get building and facilities (gedung) data including pending/in-progress maintenance requests.',
    input_schema: {
      type: 'object',
      properties: {
        status_filter: {
          type: 'string',
          enum: ['pending', 'in_progress', 'all_active', 'completed'],
          description: 'Filter maintenance requests by status (default: all_active = pending + in progress)',
        },
        limit: { type: 'integer', description: 'Max records to return (default: 15)' },
      },
      required: [],
    },
  },
]

async function executeTool(name, input) {
  await dbConnect()
  const now = new Date()
  const thirtyDaysLater = addDays(now, 30)

  try {
    if (name === 'get_dashboard_stats') {
      const [
        totalKaryawan, karyawanAktif, kontrakBerakhir,
        totalAset, asetDipinjam,
        maintenancePending,
        totalKendaraan, kendaraanTersedia,
        pajakJatuhTempo,
      ] = await Promise.all([
        Karyawan.countDocuments(),
        Karyawan.countDocuments({ statusAktif: true }),
        Karyawan.countDocuments({
          tanggalKontrakBerakhir: { $gte: now, $lte: thirtyDaysLater },
          statusAktif: true,
        }),
        Aset.countDocuments(),
        Aset.countDocuments({ status: 'DIPINJAM' }),
        MaintenanceRequest.countDocuments({ status: { $in: ['PENDING', 'PROSES'] } }),
        Kendaraan.countDocuments(),
        Kendaraan.countDocuments({ status: 'TERSEDIA' }),
        PembayaranPajak.countDocuments({
          status: 'BELUM',
          tanggalJatuhTempo: { $gte: now, $lte: thirtyDaysLater },
        }),
      ])
      return JSON.stringify({
        karyawan: { total: totalKaryawan, aktif: karyawanAktif, kontrakBerakhirDalam30Hari: kontrakBerakhir },
        aset: { total: totalAset, dipinjam: asetDipinjam, tersedia: totalAset - asetDipinjam },
        maintenance: { pending: maintenancePending },
        kendaraan: { total: totalKendaraan, tersedia: kendaraanTersedia, digunakan: totalKendaraan - kendaraanTersedia },
        pajak: { jatuhTempoDalam30Hari: pajakJatuhTempo },
      })
    }

    if (name === 'get_karyawan_data') {
      const limit = input.limit || 15
      let query = {}
      if (input.filter === 'active') query.statusAktif = true
      if (input.filter === 'inactive') query.statusAktif = false
      if (input.filter === 'expiring_soon') {
        query.tanggalKontrakBerakhir = { $gte: now, $lte: thirtyDaysLater }
        query.statusAktif = true
      }

      const [karyawan, byKontrak, total] = await Promise.all([
        Karyawan.find(query)
          .select('nama jabatan departemen statusKontrak statusAktif tanggalKontrakBerakhir tanggalMasuk')
          .limit(limit)
          .sort({ nama: 1 })
          .lean(),
        Karyawan.aggregate([
          { $match: { statusAktif: true } },
          { $group: { _id: '$statusKontrak', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Karyawan.countDocuments(query),
      ])

      return JSON.stringify({ total, karyawan, byKontrak, filter: input.filter || 'all' })
    }

    if (name === 'get_aset_data') {
      const limit = input.limit || 15
      let query = {}
      if (input.filter === 'available') query.status = 'TERSEDIA'
      if (input.filter === 'borrowed') query.status = 'DIPINJAM'
      if (input.filter === 'maintenance') query.status = 'MAINTENANCE'

      const [aset, byKategori, total] = await Promise.all([
        Aset.find(query)
          .select('nama kategori kondisi status lokasi nomorAset')
          .limit(limit)
          .sort({ nama: 1 })
          .lean(),
        Aset.aggregate([
          { $group: { _id: '$kategori', total: { $sum: 1 }, dipinjam: { $sum: { $cond: [{ $eq: ['$status', 'DIPINJAM'] }, 1, 0] } } } },
          { $sort: { total: -1 } },
        ]),
        Aset.countDocuments(query),
      ])

      return JSON.stringify({ total, aset, byKategori, filter: input.filter || 'all' })
    }

    if (name === 'get_kendaraan_data') {
      const include = input.include || 'all'
      const result = {}

      if (include === 'list' || include === 'all') {
        result.kendaraan = await Kendaraan.find()
          .select('noPol merk jenis status kondisi tahun')
          .sort({ noPol: 1 })
          .lean()
      }
      if (include === 'jadwal' || include === 'all') {
        result.jadwalMendatang = await JadwalKendaraan.find({
          status: { $ne: 'DIBATALKAN' },
          tanggalBerangkat: { $gte: now },
        })
          .populate('kendaraanId', 'noPol merk')
          .select('keperluan tanggalBerangkat tujuan status pengemudi')
          .limit(10)
          .sort({ tanggalBerangkat: 1 })
          .lean()
      }
      if (include === 'perawatan' || include === 'all') {
        result.perawatanTerakhir = await PerawatanKendaraan.find()
          .populate('kendaraanId', 'noPol merk')
          .select('jenis tanggalPerawatan biaya keterangan')
          .limit(10)
          .sort({ tanggalPerawatan: -1 })
          .lean()
      }
      if (include === 'pajak' || include === 'all') {
        result.pajakJatuhTempo = await PembayaranPajak.find({
          status: 'BELUM',
          tanggalJatuhTempo: { $gte: now, $lte: thirtyDaysLater },
        })
          .populate('kendaraanId', 'noPol merk')
          .select('jenisPajak tanggalJatuhTempo nominal status')
          .limit(10)
          .sort({ tanggalJatuhTempo: 1 })
          .lean()
      }

      return JSON.stringify(result)
    }

    if (name === 'get_gedung_data') {
      const limit = input.limit || 15
      let statusQuery = { $in: ['PENDING', 'PROSES'] }
      if (input.status_filter === 'pending') statusQuery = 'PENDING'
      if (input.status_filter === 'in_progress') statusQuery = 'PROSES'
      if (input.status_filter === 'completed') statusQuery = 'SELESAI'

      const [maintenance, total] = await Promise.all([
        MaintenanceRequest.find({ status: statusQuery })
          .select('judul lokasi prioritas status tanggalRequest deskripsi')
          .limit(limit)
          .sort({ prioritas: -1, tanggalRequest: -1 })
          .lean(),
        MaintenanceRequest.countDocuments({ status: statusQuery }),
      ])

      const byPrioritas = await MaintenanceRequest.aggregate([
        { $match: { status: { $in: ['PENDING', 'PROSES'] } } },
        { $group: { _id: '$prioritas', count: { $sum: 1 } } },
      ])

      return JSON.stringify({ total, maintenance, byPrioritas })
    }

    return JSON.stringify({ error: `Unknown tool: ${name}` })
  } catch (err) {
    return JSON.stringify({ error: err.message })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { messages } = body
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages array is required' }), { status: 400 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const apiMessages = [...messages]

        // Agentic tool-calling loop
        while (true) {
          const response = await client.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            tools,
            messages: apiMessages,
          })

          if (response.stop_reason === 'end_turn') {
            // Extract and send the final text
            for (const block of response.content) {
              if (block.type === 'text') {
                send({ type: 'text', text: block.text })
              }
            }
            break
          }

          if (response.stop_reason === 'tool_use') {
            // Append assistant response (including thinking blocks) to maintain context
            apiMessages.push({ role: 'assistant', content: response.content })

            const toolResults = []
            for (const block of response.content) {
              if (block.type === 'tool_use') {
                send({ type: 'tool_start', tool: block.name })
                const result = await executeTool(block.name, block.input)
                toolResults.push({
                  type: 'tool_result',
                  tool_use_id: block.id,
                  content: result,
                })
              }
            }

            apiMessages.push({ role: 'user', content: toolResults })
          } else {
            // Unexpected stop reason — send whatever text exists
            for (const block of response.content) {
              if (block.type === 'text') send({ type: 'text', text: block.text })
            }
            break
          }
        }

        send({ type: 'done' })
        controller.close()
      } catch (err) {
        send({ type: 'error', message: err.message || 'Terjadi kesalahan pada AI assistant' })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
