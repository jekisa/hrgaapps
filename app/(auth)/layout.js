export const metadata = {
  title: 'Login - HRGA Apps',
}

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900">
      {children}
    </div>
  )
}
