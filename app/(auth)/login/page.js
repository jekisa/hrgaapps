'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, LogIn, Building2, Mail, Lock, Users, Package, Car, Wrench, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const features = [
  { icon: Users, label: 'Manajemen Karyawan', desc: 'Data kepegawaian lengkap' },
  { icon: Package, label: 'Inventaris Aset', desc: 'Tracking & peminjaman aset' },
  { icon: Car, label: 'Fleet Kendaraan', desc: 'Jadwal & perawatan armada' },
  { icon: Wrench, label: 'Fasilitas Gedung', desc: 'Maintenance & utilitas' },
]

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
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
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 relative overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f172a]" />

        {/* Animated orbs */}
        <div className="absolute top-[-80px] right-[-60px] w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-100px] left-[-80px] w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">HRGA Apps</span>
            <p className="text-primary-300 text-[10px] mt-0.5 uppercase tracking-widest">Management System</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">Selamat datang di</p>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Human Resources<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-primary-200">
                &amp; General Affairs
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mt-3 max-w-xs">
              Sistem manajemen terpadu untuk pengelolaan karyawan, aset, kendaraan, dan fasilitas perusahaan.
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {features.map((f, idx) => (
              <div
                key={f.label}
                className="flex items-center gap-3 animate-appear"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="w-8 h-8 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
                  <f.icon className="w-4 h-4 text-primary-300" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{f.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{f.desc}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-slate-600 text-xs">
          &copy; {new Date().getFullYear()} HRGA Apps &mdash; All rights reserved
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 relative">
        {/* Subtle background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#eff6ff_0%,_transparent_60%)]" />

        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">HRGA Apps</p>
              <p className="text-xs text-gray-400">Management System</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Masuk</h2>
              <p className="text-gray-400 mt-1 text-sm">Masukkan kredensial Anda untuk melanjutkan</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="form-label">Alamat Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    className="form-input pl-10"
                    placeholder="email@perusahaan.com"
                    {...register('email', {
                      required: 'Email wajib diisi',
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Format email tidak valid' },
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input pl-10 pr-10"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password wajib diisi',
                      minLength: { value: 6, message: 'Password minimal 6 karakter' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-2.5 mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Sistem
                  </>
                )}
              </button>
            </form>
          </div>

          {/* <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <p className="text-[11px] font-bold text-blue-800 mb-2 uppercase tracking-wider">Akun Demo</p>
            <div className="space-y-1.5 text-xs text-blue-700">
              <p><span className="font-semibold">Admin:</span> admin@hrgaapps.com / admin123</p>
              <p><span className="font-semibold">Staff:</span> staff@hrgaapps.com / staff123</p>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  )
}
