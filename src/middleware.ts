import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 🔒 REGRA DE OURO: Proteger rotas /admin
  const isAdmin = user?.email?.startsWith('admin.') || 
                  user?.email?.endsWith('@glorioso.com') ||
                  user?.email === 'ccviolla@gmail.com';
  const isPathAdmin = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname.includes('/admin/login');

  if (isPathAdmin && !isLoginPage) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    if (!isAdmin) {
      console.log('🛑 [Middleware] Acesso negado para cliente:', user?.email);
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Se já logado como admin, não deixa ir pro login
  if (isLoginPage && user && isAdmin) {
    return NextResponse.redirect(new URL('/admin/orders', request.url))
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
