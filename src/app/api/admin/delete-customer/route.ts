import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
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

    // 2. Receber os dados com segurança
    const body = await request.json().catch(() => ({}));
    const { phone } = body;

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

    // Buscar o cliente para verificar se ele tem um user_id associado
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('user_id, phone')
      .eq('phone', phone)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ error: 'Erro de busca: ' + fetchError.message }, { status: 500 });
    }

    if (!customer) {
      return NextResponse.json({ error: 'Cliente não encontrado no banco' }, { status: 404 });
    }

    // A. Deletar da tabela customers PRIMEIRO
    // Se houver restrição de FK, isso vai falhar e nos dizer o motivo
    const { error: dbDeleteError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('phone', phone);

    if (dbDeleteError) {
      // Se o erro for de Foreign Key, vamos dar uma mensagem clara
      if (dbDeleteError.code === '23503') {
        return NextResponse.json({ 
          error: 'Não é possível excluir este cliente porque ele possui pedidos vinculados. Remova ou altere os pedidos primeiro.' 
        }, { status: 400 });
      }
      return NextResponse.json({ error: 'Erro ao excluir no banco: ' + dbDeleteError.message }, { status: 500 });
    }

    // B. Se a exclusão no banco deu certo, e ele tiver user_id, deletar da autenticação
    if (customer.user_id) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(customer.user_id);
      } catch (e) {
        console.error('Erro (não crítico) ao deletar usuário Auth:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Cliente excluído com sucesso' });

  } catch (error: any) {
    console.error('Erro fatal:', error);
    return NextResponse.json({ 
      error: 'Erro crítico: ' + (error.message || 'Desconhecido') 
    }, { status: 500 });
  }
}
