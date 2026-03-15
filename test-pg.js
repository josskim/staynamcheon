const { Client } = require('pg');

async function testConnection() {
  const connectionString = "postgresql://neondb_owner:npg_6NOnL3XWqCtf@ep-late-frost-a1dl7dc2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const client = new Client({ connectionString });

  try {
    console.log('Attempting to connect to Neon...');
    await client.connect();
    console.log('Successfully connected!');
    const res = await client.query('SELECT NOW()');
    console.log('Query result:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed deeply:', err.message);
  } finally {
    await client.end();
  }
}

testConnection();
