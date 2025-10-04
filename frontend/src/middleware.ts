import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/auth/signin',
  '/auth/signup',
  '/auth/error'
])

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl
  
  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Skip auth for public routes and webhooks
  if (isPublicRoute(req) || pathname.startsWith('/api/webhooks/clerk')) {
    return response
  }
  
  // Get auth info
  const { userId } = await auth()
  
  // Protect all other routes
  if (!userId) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }
  
  // Redirect authenticated users from root to dashboard
  if (pathname === '/' && userId) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  return response
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}