import { PrismaClient } from '@prisma/client'

const requireEnv = (key) => {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is required`)
  }
  return value
}

const prisma = new PrismaClient({
  datasources: { db: { url: requireEnv('DATABASE_URL') } }
})

const count = await prisma.stayGalleryItem.count()
const item = await prisma.stayGalleryItem.create({
  data: {
    imageUrl: 'https://res.cloudinary.com/ddwzlwbt8/image/upload/v1775044397/staynamcheon/gallery/ufdaggctijubp10bmm0o.jpg',
    publicId: 'staynamcheon/gallery/ufdaggctijubp10bmm0o',
    type: 'image',
    isMain: false,
    isVisible: true,
    order: count + 1,
  }
})
console.log('Created:', item.id)
await prisma.$disconnect()
