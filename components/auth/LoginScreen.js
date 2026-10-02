'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import {
  Eye, EyeOff, LogIn, Mail, LockKeyhole, UsersRound, PackageCheck,
  CarFront, Wrench, CircleCheckBig, CalendarDays, FileText, WalletCards, BellRing,
} from 'lucide-react'
import toast from 'react-hot-toast'
import AppLogo from '@/components/ui/AppLogo'
import appBrand from '@/lib/app-brand'

const { APP_NAME } = appBrand

const PORTAL_COPY = {
  ADMIN: {
    eyebrow: 'Selamat datang di',
    title: <>Human Resources<br /><span className="auth-admin-highlight">&amp; General Affairs</span></>,
    description: 'Sistem manajemen terpadu untuk pengelolaan karyawan, aset, kendaraan, dan fasilitas perusahaan.',
    features: [
      { icon: UsersRound, label: 'Manajemen Karyawan', desc: 'Data kepegawaian lengkap' },
      { icon: PackageCheck, label: 'Inventaris Aset', desc: 'Tracking & peminjaman aset' },
      { icon: CarFront, label: 'Fleet Kendaraan', desc: 'Jadwal & perawatan armada' },
      { icon: Wrench, label: 'Fasilitas Gedung', desc: 'Maintenance & utilitas' },
    ],
    switchHref: '/login/staff',
    switchText: 'Login sebagai Staff? Klik di sini',
    submitLabel: 'Login Now',
  },
  STAFF: {
    eyebrow: 'Akses untuk Anda',
    title: <>Portal<br /><span className="auth-staff-highlight">Karyawan</span></>,
    description: 'Akses informasi dan layanan HRGA yang berkaitan dengan aktivitas kerja Anda.',
    features: [
      { icon: CalendarDays, label: 'Ajukan Cuti', desc: 'Kirim pengajuan cuti dengan mudah' },
      { icon: WalletCards, label: 'Pantau Sisa Cuti', desc: 'Lihat saldo cuti personal Anda' },
      { icon: FileText, label: 'Upload Surat Dokter', desc: 'Kirim lampiran melalui portal staff' },
      { icon: BellRing, label: 'Lihat Reminder', desc: 'Akses menu reminder pekerjaan' },
    ],
    switchHref: '/login',
    switchText: 'Login sebagai Admin? Klik di sini',
    submitLabel: 'Masuk ke Portal Staff',
  },
}

export default function LoginScreen({ role = 'ADMIN' }) {
  const portalRole = role === 'STAFF' ? 'STAFF' : 'ADMIN'
  const isStaff = portalRole === 'STAFF'
  const copy = PORTAL_COPY[portalRole]
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: { rememberMe: false } })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        expectedRole: portalRole,
        rememberMe: data.rememberMe ? 'true' : 'false',
        redirect: false,
      })

      if (result?.error) {
        toast.error('Email atau password salah, atau akun tidak sesuai dengan portal ini.')
      } else {
        toast.success('Login berhasil!')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('Terjadi kesalahan saat login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className={`auth-screen ${isStaff ? 'auth-screen-staff' : 'auth-screen-admin'}`} data-portal={portalRole}>
      <section className="auth-brand-panel" aria-label={isStaff ? 'Informasi portal karyawan' : 'Informasi HRGA'}>
        <div className="auth-panel-backdrop" aria-hidden="true">
          <div className="auth-grid-pattern" />
          <div className="auth-orb auth-orb-one" />
          <div className="auth-orb auth-orb-two" />
          <div className="auth-orb auth-orb-three" />
        </div>

        <div className="auth-brand-content">
          <AppLogo
            showWordmark
            markClassName="h-11 w-11"
            wordmarkClassName="text-lg text-white"
            subtitleClassName="text-primary-300"
          />

          <div className="auth-brand-message">
            <div>
              <p className="auth-eyebrow">{copy.eyebrow}</p>
              <h1 className="auth-brand-title">{copy.title}</h1>
              <p className="auth-brand-description">{copy.description}</p>
            </div>
            <ul className="auth-feature-list">
              {copy.features.map(({ icon: Icon, label, desc }, index) => (
                <li key={label} className="auth-feature-item" style={{ animationDelay: `${index * 80}ms` }}>
                  <span className="auth-feature-icon"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  <span className="auth-feature-copy"><strong>{label}</strong><small>{desc}</small></span>
                  <CircleCheckBig className="auth-feature-check h-4 w-4" aria-hidden="true" />
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-copyright">&copy; {new Date().getFullYear()} {APP_NAME} &mdash; All rights reserved</p>
        </div>
      </section>

      <section className="auth-form-panel" aria-label={`Login ${isStaff ? 'Staff' : 'Admin'}`}>
        <div className="auth-form-wrap">
          <AppLogo
            className="auth-mobile-logo"
            showWordmark
            markClassName="h-10 w-10"
            wordmarkClassName="text-base text-slate-900"
            subtitleClassName="text-slate-400"
          />

          <div className="auth-card">
            <header className="auth-card-header">
              <h2>Login</h2>
              <p>{isStaff ? 'Masuk untuk mengakses layanan HRGA personal Anda.' : 'Jangan lupa berdoa sebelum bekerja.'}</p>
            </header>

            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="auth-field">
                <label htmlFor="login-email">Alamat Email</label>
                <div className="auth-input-wrap">
                  <Mail className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="email@perusahaan.com"
                    {...register('email', {
                      required: 'Email wajib diisi',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Format email tidak valid' },
                    })}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'login-email-error' : undefined}
                  />
                </div>
                {errors.email && <p id="login-email-error" className="auth-field-error">{errors.email.message}</p>}
              </div>

              <div className="auth-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-input-wrap">
                  <LockKeyhole className="auth-input-icon" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    {...register('password', {
                      required: 'Password wajib diisi',
                      minLength: { value: 6, message: 'Password minimal 6 karakter' },
                    })}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="auth-password-toggle"
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p id="login-password-error" className="auth-field-error">{errors.password.message}</p>}
              </div>

              <div className="auth-options-row">
                <label className="auth-remember-label">
                  <input type="checkbox" {...register('rememberMe')} />
                  <span>Ingat Saya</span>
                </label>
                <Link className="auth-text-link" href="/forgot-password">Lupa Password?</Link>
              </div>

              <button type="submit" disabled={loading} className="auth-submit">
                {loading ? <span className="auth-spinner" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
                {loading ? 'Memproses...' : copy.submitLabel}
              </button>
            </form>

            <p className="auth-switch-link"><Link href={copy.switchHref}>{copy.switchText}</Link></p>
          </div>
        </div>
      </section>
    </main>
  )
}
