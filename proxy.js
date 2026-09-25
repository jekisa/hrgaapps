import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import leaveMenu from '@/lib/leave-menu'
import accessControl from '@/lib/access-control'

const { getStaffLeaveRedirect } = leaveMenu
const { getStaffRestrictedRedirect } = accessControl

export default withAuth(function middleware(request) {
  const role = request.nextauth.token?.role
  const destination = getStaffLeaveRedirect(
    role,
    request.nextUrl.pathname
  ) || getStaffRestrictedRedirect(role, request.nextUrl.pathname)

  if (!destination) return NextResponse.next()

  const url = request.nextUrl.clone()
  url.pathname = destination
  url.search = ''
  return NextResponse.redirect(url)
})

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
