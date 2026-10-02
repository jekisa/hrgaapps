import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from './db'
import User from '@/models/User'
import authPolicy from './auth-policy'

const { encodeSessionToken, matchesLoginRole, createEmailLookup } = authPolicy

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        expectedRole: { label: 'Portal', type: 'text' },
        rememberMe: { label: 'Ingat Saya', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email dan password harus diisi')
        }

        await dbConnect()
        const user = await User.findOne({ email: createEmailLookup(credentials.email) })

        if (!user || !user.isActive) {
          throw new Error('Email atau password salah')
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          throw new Error('Email atau password salah')
        }

        if (!matchesLoginRole(credentials.expectedRole, user.role)) {
          throw new Error('Akun tidak sesuai dengan portal login ini')
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          rememberMe: credentials.rememberMe === 'true',
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.rememberMe = user.rememberMe === true
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    encode: encodeSessionToken,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
