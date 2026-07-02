const { Client } = require('pg');

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

async function main() {
  const connectionString = requireEnv('DATABASE_URL');
  const client = new Client({ connectionString });
  
  try {
    console.log('Connecting...');
    await client.connect();
    console.log('Connected!');
    const res = await client.query('SELECT current_user, current_database()');
    console.log(res.rows[0]);
  } catch (err) {
    console.error('Error:', err.stack);
  } finally {
    await client.end();
  }
}

main();
