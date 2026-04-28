
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Checking tables...');
  // Try to select from a hypothetical store_config table
  const { data, error } = await supabase.from('store_config').select('*');
  
  if (error) {
    console.log('Table store_config might not exist:', error.message);
    
    // Try to list tables by querying pg_tables (if possible via RPC or just check error)
    console.log('Attempting to check categories table as fallback...');
    const { data: catData, error: catError } = await supabase.from('categories').select('*').limit(1);
    if (catError) {
      console.log('Error fetching categories:', catError.message);
    } else {
      console.log('Categories table exists. DB connection OK.');
    }
  } else {
    console.log('store_config table exists:', data);
  }
}

checkTables();
