'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Mail, Send } from 'lucide-react'
import AppLogo from '@/components/ui/AppLogo'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email }) => {
    setLoading(true)
    setRequestError('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || 'Permintaan belum dapat diproses. Coba lagi nanti.')
      setSubmitted(true)
    } catch (error) {
      setRequestError(error.message || 'Permintaan belum dapat diproses. Coba lagi nanti.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-forgot-page">
      <div className="auth-forgot-wrap">
        <AppLogo className="mb-8" showWordmark wordmarkClassName="text-base text-slate-900" subtitleClassName="text-slate-400" />
        <section className="auth-card">
          <header className="auth-card-header">
            <h1>Lupa Password?</h1>
            <p>Masukkan alamat email akun Anda untuk meminta link reset password.</p>
          </header>

          {submitted ? (
            <div role="status" aria-live="polite">
              <div className="auth-reset-success">
                <span className="auth-reset-success-icon"><Mail className="h-5 w-5" aria-hidden="true" /></span>
                <p>Jika email terdaftar, link reset akan dikirim.</p>
              </div>
              <p className="auth-reset-email-note">Pengiriman email reset belum dikonfigurasi. Silakan hubungi administrator untuk bantuan.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="auth-field">
                <label htmlFor="reset-email">Alamat Email</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@perusahaan.com"
                    {...register('email', {
                      required: 'Email wajib diisi',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Format email tidak valid' },
                    })}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'reset-email-error' : undefined}
                  />
                </div>
                {errors.email && <p id="reset-email-error" className="auth-field-error">{errors.email.message}</p>}
              </div>
              {requestError && <p className="auth-field-error" role="alert">{requestError}</p>}
              <button className="auth-submit" type="submit" disabled={loading}>
                <Send className="h-4 w-4" aria-hidden="true" />
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}

          <Link className="auth-back-link" href="/login"><ArrowLeft className="h-4 w-4" />Kembali ke Login</Link>
        </section>
      </div>
    </main>
  )
}
