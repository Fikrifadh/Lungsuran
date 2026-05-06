const { Client } = require('pg');

const project_id = 'nuwuuqmfokgpdnqsfzrc';
const password = 'Niatikhl443';

const configs = [
  {
    name: 'Singapore (ap-southeast-1)',
    url: `postgresql://postgres.${project_id}:${password}@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'Jakarta (ap-southeast-3)',
    url: `postgresql://postgres.${project_id}:${password}@aws-0-ap-southeast-3.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'US East (us-east-1)',
    url: `postgresql://postgres.${project_id}:${password}@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`
  },
  {
    name: 'Sydney (ap-southeast-2)',
    url: `postgresql://postgres.${project_id}:${password}@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`
  }
];

async function testConfig(config) {
  console.log(`Testing: ${config.name}...`);
  const client = new Client({ connectionString: config.url });
  try {
    await client.connect();
    console.log(`✅ SUCCESS: ${config.name}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED: ${config.name} - ${err.message}`);
    return false;
  }
}

async function run() {
  for (const config of configs) {
    await testConfig(config);
    console.log('---');
  }
}

run();
