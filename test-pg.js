const { Client } = require('pg');

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

async function testConnection() {
  const connectionString = requireEnv('DATABASE_URL');
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
