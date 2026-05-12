const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://oclnccsublpamptcdojf.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  try {
    console.log("--- AUTH USERS ---");
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) console.error(authError);
    else users.forEach(u => console.log(`Auth User: ${u.id} | Email: ${u.email} | Metadata:`, JSON.stringify(u.user_metadata)));

    console.log("\n--- PUBLIC CUSTOMERS ---");
    const { data: customers, error: custError } = await supabase.from('customers').select('*');
    if (custError) console.error(custError);
    else customers.forEach(c => console.log(`Customer: ${c.name} | Phone: ${c.phone} | UserID: ${c.user_id}`));
  } catch (err) {
    console.error("ERRO FATAL:", err.message);
  }
}

check();
