import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_URL=([^ \n]+)/);
const keyMatch = envFile.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^ \n]+)/);

const supabaseUrl = urlMatch ? urlMatch[1] : '';
const supabaseKey = keyMatch ? keyMatch[1] : '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPolicies() {
  const { data, error } = await supabase.from('store_config').select('*').limit(1);
  console.log('Read store_config:', data ? 'OK' : 'FAIL', error);
  
  // try inserting
  const { data: d2, error: e2 } = await supabase.from('store_config').update({ is_auto_mode: false }).eq('id', 1);
  console.log('Update store_config:', d2 ? 'OK' : 'FAIL', e2);
}

checkPolicies();
