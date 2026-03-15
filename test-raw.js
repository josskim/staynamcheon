const { Client } = require('pg');

async function main() {
  const connectionString = "postgresql://neondb_owner:npg_6NOnL3XWqCtf@ep-late-frost-a1dl7dc2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
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
