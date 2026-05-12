
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
  const { data, error } = await supabase.from('customers').select('*').limit(1);
  if (error) {
    console.error('Error fetching customers:', error);
  } else {
    console.log('Sample customer data:', data);
    // Try to get columns
    const { data: cols, error: err } = await supabase.rpc('get_table_columns', { table_name: 'customers' });
    if (err) console.log('RPC get_table_columns not found, common columns are: id, name, phone, user_id, email, created_at');
    else console.log('Columns:', cols);
  }
}

checkSchema();
