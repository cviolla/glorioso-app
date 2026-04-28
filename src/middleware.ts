import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.getSession();

  // Se o usuário tentar acessar qualquer rota /admin (exceto login) e não estiver logado
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.includes('/admin/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // Se o usuário já estiver logado e tentar ir para o login, manda pro dashboard
  if (req.nextUrl.pathname === '/admin/login' && session) {
    return NextResponse.redirect(new URL('/admin/orders', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
