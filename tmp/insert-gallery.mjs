import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: { db: { url: 'postgresql://neondb_owner:npg_etYKQh15ZuTR@ep-late-frost-a1dl7dc2-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' } }
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
