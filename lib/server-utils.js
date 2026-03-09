export async function createAuditLog(userId, aksi, modul, detail, ipAddress) {
  try {
    const dbConnect = (await import('./db')).default
    const AuditLog = (await import('@/models/AuditLog')).default
    await dbConnect()
    await AuditLog.create({
      userId: userId || null,
      aksi,
      modul,
      detail,
      ipAddress: ipAddress || null,
    })
  } catch (err) {
    console.error('Audit log error:', err)
  }
}

export function getIpAddress(request) {
  return (
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}
