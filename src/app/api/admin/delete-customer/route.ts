import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
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

  // 2. Receber os dados
  const { phone } = await request.json();

  if (!phone) {
    return NextResponse.json({ error: 'Telefone do cliente é obrigatório' }, { status: 400 });
  }

  // 3. Usar o Service Role para as operações administrativas
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

  try {
    // Buscar o cliente para verificar se ele tem um user_id associado
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('user_id, phone')
      .eq('phone', phone)
      .single();

    if (fetchError || !customer) {
      return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
    }

    // A. Se tiver user_id, deletar da autenticação do Supabase
    if (customer.user_id) {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(customer.user_id);
      if (authDeleteError) {
        console.error('Erro ao deletar usuário Auth:', authDeleteError);
      }
    }

    // B. Deletar da tabela customers usando o telefone como chave
    const { error: dbDeleteError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('phone', phone);

    if (dbDeleteError) {
      throw dbDeleteError;
    }

    return NextResponse.json({ success: true, message: 'Cliente excluído com sucesso' });

  } catch (error: any) {
    console.error('Erro na exclusão:', error);
    return NextResponse.json({ error: error.message || 'Erro ao excluir cliente' }, { status: 500 });
  }
}
