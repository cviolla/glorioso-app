
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltam variáveis de ambiente Supabase.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSettings() {
  const methods = ['PIX', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito', 'Voucher'];
  
  console.log('Atualizando métodos de pagamento para:', methods);
  
  const { data, error } = await supabase
    .from('store_settings')
    .update({ payment_methods: methods })
    .eq('id', 1);

  if (error) {
    console.error('Erro ao atualizar configurações:', error);
  } else {
    console.log('Configurações atualizadas com sucesso!', data);
  }
}

updateSettings();
