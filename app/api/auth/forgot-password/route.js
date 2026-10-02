import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import PasswordResetToken from '@/models/PasswordResetToken'
import passwordReset from '@/lib/password-reset'

const { handlePasswordResetRequest } = passwordReset
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request) {
  let email
  try {
    const body = await request.json()
    email = typeof body.email === 'string' ? body.email.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: 'Alamat email tidak valid.' }, { status: 400 })
  }

  try {
    await dbConnect()
    // Email delivery is intentionally not attempted until a provider is configured.
    // The token stays hashed in storage and is never returned by this endpoint.
    const result = await handlePasswordResetRequest({ email, UserModel: User, PasswordResetTokenModel: PasswordResetToken })
    return NextResponse.json({ message: result.message }, { status: result.status })
  } catch {
    return NextResponse.json({ error: 'Permintaan belum dapat diproses. Coba lagi nanti.' }, { status: 503 })
  }
}
