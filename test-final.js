const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

function requireEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

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
      url: requireEnv('DATABASE_URL')
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
