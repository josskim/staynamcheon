const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

// Manually parse .env because we don't have dotenv easily available
const envContent = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
const lines = envContent.split('\n');
for (const line of lines) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
    process.env[key.trim()] = value;
  }
}

console.log('Loaded DATABASE_URL length:', process.env.DATABASE_URL?.length);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    const count = await prisma.admin.count();
    console.log('Static admin count:', count);
  } catch (e) {
    console.error('Connection failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
