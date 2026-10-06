const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const configuredDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = configuredDatabaseUrl?.startsWith('file:') && path.isAbsolute(configuredDatabaseUrl.slice(5))
  ? configuredDatabaseUrl
  : `file:${path.resolve(process.cwd(), configuredDatabaseUrl?.slice(5) || 'prisma/dev.db')}`;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
const fallbackImage = 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop';
const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'public/uploads');

async function main() {
  const brokenUnsplash = { contains: 'photo-1583391733975-2313a4049a3a' };
  const categoryFix = await prisma.category.updateMany({ where: { image: brokenUnsplash }, data: { image: fallbackImage } });
  const productImageFix = await prisma.productImage.updateMany({ where: { url: brokenUnsplash }, data: { url: fallbackImage } });
  const promotionFix = await prisma.promotion.updateMany({ where: { bannerImage: brokenUnsplash }, data: { bannerImage: fallbackImage } });

  let missingUploadFixes = 0;
  const repairMissingUpload = async (record, field, update) => {
    const value = record[field];
    if (!value || !value.startsWith('/uploads/')) return;
    const filePath = path.join(uploadDir, path.basename(value));
    if (!fs.existsSync(filePath)) {
      await update({ [field]: fallbackImage });
      missingUploadFixes += 1;
    }
  };

  const uploadedImages = await prisma.productImage.findMany({ where: { url: { startsWith: '/uploads/' } } });
  for (const image of uploadedImages) {
    await repairMissingUpload(image, 'url', (data) => prisma.productImage.update({ where: { id: image.id }, data }));
  }
  const categories = await prisma.category.findMany({ where: { image: { startsWith: '/uploads/' } } });
  for (const category of categories) {
    await repairMissingUpload(category, 'image', (data) => prisma.category.update({ where: { id: category.id }, data }));
  }
  const promotions = await prisma.promotion.findMany({ where: { bannerImage: { startsWith: '/uploads/' } } });
  for (const promotion of promotions) {
    await repairMissingUpload(promotion, 'bannerImage', (data) => prisma.promotion.update({ where: { id: promotion.id }, data }));
  }

  console.log(`Repaired ${categoryFix.count} category image(s), ${productImageFix.count + promotionFix.count} broken remote image(s), and ${missingUploadFixes} missing upload(s).`);
}

main().catch((error) => {
  console.error('Media repair failed:', error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
