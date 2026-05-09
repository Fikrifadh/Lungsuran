const { Client } = require('pg');

async function testDirect() {
  // Direct connection from .env
  const url = "postgresql://postgres:Niatikhl443@db.nuwuuqmfokgpdnqsfzrc.supabase.co:5432/postgres";
  console.log('Testing DIRECT connection (Port 5432)...');
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('✅ SUCCESS: Direct connection works!');
    await client.end();
  } catch (err) {
    console.log('❌ FAILED Direct:', err.message);
  }
}

async function testPooler() {
  // Pooler connection from .env
  const url = "postgresql://postgres:Niatikhl443@db.nuwuuqmfokgpdnqsfzrc.supabase.co:6543/postgres?pgbouncer=true";
  console.log('Testing POOLER connection (Port 6543)...');
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log('✅ SUCCESS: Pooler connection works!');
    await client.end();
  } catch (err) {
    console.log('❌ FAILED Pooler:', err.message);
  }
}

async function run() {
    await testDirect();
    console.log('---');
    await testPooler();
}

run();
