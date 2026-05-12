import { createClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  
  // 1. Verificar se o usuário está autenticado no painel admin
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // 2. Processar o reset
  const { phone, newPassword } = await request.json();

  if (!phone || !newPassword) {
    return NextResponse.json({ error: 'Telefone e nova senha são obrigatórios' }, { status: 400 });
  }

  // O e-mail virtual segue o padrão: telefone@gloriosobrownie.internal
  const virtualEmail = `${phone.replace(/\D/g, '')}@gloriosobrownie.internal`;

  // 3. Usar o Service Role para atualizar a senha
  // IMPORTANTE: O Service Role permite bypass de RLS e gestão de usuários
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  // Buscar o usuário pelo e-mail virtual primeiro para pegar o ID
  const { data: userData, error: findError } = await supabaseAdmin
    .from('customers')
    .select('user_id')
    .eq('phone', phone)
    .single();

  if (findError || !userData?.user_id) {
    // Se não achar na tabela customers, tentamos buscar direto no Auth pelo email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = users.find(u => u.email === virtualEmail);
    
    if (listError || !targetUser) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  } else {
    // Se achou o user_id, atualiza direto
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user_id,
      { password: newPassword }
    );

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Senha atualizada com sucesso!' });
}
