const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Basic .env loader (Disabled for isolated test)
/*
const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
env.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=');
  if (key && rest.length) {
    process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '');
  }
});
*/

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_6NOnL3XWqCtf@ep-late-frost-a1dl7dc2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function main() {
  try {
    console.log('Testing with URL:', process.env.DATABASE_URL?.substring(0, 30) + '...');
    const count = await prisma.admin.count();
    console.log('Admin count:', count);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
