const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');

const configuredDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = configuredDatabaseUrl?.startsWith('file:') && path.isAbsolute(configuredDatabaseUrl.slice(5))
  ? configuredDatabaseUrl
  : `file:${path.resolve(__dirname, '../../frontend/prisma/dev.db')}`;
const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

async function main() {
  console.log('🌱 Seeding House of Ramyaa database...');

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      name: 'Ramyaa Admin',
      email: 'admin@ramyaa.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+91 98290 12345',
    },
  });

  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.create({
    data: {
      name: 'Ananya Sharma',
      email: 'customer@ramyaa.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
    },
  });

  console.log('✅ Admin & Customer accounts created');

  // Categories
  const categoriesData = [
    {
      name: 'Bandhani',
      slug: 'bandhani',
      description: 'Traditional tie-dye textile artistry from the heart of Rajasthan',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Leheriya',
      slug: 'leheriya',
      description: 'Vibrant wave patterns representing the joyous monsoon spirits of Jaipur',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Gota Patti',
      slug: 'gota-patti',
      description: 'Exquisite applique embroidery handcrafted with gold and silver metallic ribbons',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Block Print',
      slug: 'block-print',
      description: 'Hand-block printed Sanganeri and Bagru textiles on pure cotton',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Kota Doria',
      slug: 'kota-doria',
      description: 'Lightweight woven square check fabric known for crisp elegance',
      image: 'https://images.unsplash.com/photo-1583391733975-2313a4049a3a?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Rajasthani Suits',
      slug: 'rajasthani-suits',
      description: 'Complete 3-piece designer suit sets with regal drapes',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Kurtis',
      slug: 'kurtis',
      description: 'Modern silhouette kurtis infused with traditional Rajasthani motifs',
      image: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Sarees',
      slug: 'sarees',
      description: 'Royal Rajasthani sarees in pure silk, georgette, and organza',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Dupattas',
      slug: 'dupattas',
      description: 'Heavy statement dupattas featuring mirror work and zari borders',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'Festive Collection',
      slug: 'festive-collection',
      description: 'Grand occasionwear inspired by royal heritage palaces',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop',
    },
    {
      name: 'New Collection',
      slug: 'new-collection',
      description: 'Latest seasonal arrivals direct from Jaipuri artisan looms',
      image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop',
    },
  ];

  const categories = {};
  for (const catData of categoriesData) {
    const created = await prisma.category.create({ data: catData });
    categories[catData.slug] = created;
  }
  console.log('✅ Categories created');

  // Products Data
  const products = [
    {
      name: 'Royal Rose Pink Bandhani Silk Anarkali Suit',
      slug: 'royal-rose-pink-bandhani-anarkali',
      description: 'Embrace timeless Jaipuri royal grandeur with this handcrafted Pure Georgette Silk Anarkali suit set. Detailed with intricate tie-dye Bandhani motifs across the flared kali skirt and paired with a hand-embellished Gota Patti border dupatta.',
      mrp: 8999,
      discountPercent: 20,
      sellingPrice: 7199,
      categoryId: categories['bandhani'].id,
      isNewArrival: true,
      isBestSeller: true,
      inStock: true,
      fabric: 'Pure Georgette & Organza Dupatta',
      careInstructions: 'Dry Clean Only. Keep away from direct sunlight.',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'S', color: 'Rose Pink', colorHex: '#E785B1', stock: 5 },
        { size: 'M', color: 'Rose Pink', colorHex: '#E785B1', stock: 8 },
        { size: 'L', color: 'Rose Pink', colorHex: '#E785B1', stock: 4 },
        { size: 'XL', color: 'Rose Pink', colorHex: '#E785B1', stock: 2 },
        { size: 'XXL', color: 'Rose Pink', colorHex: '#E785B1', stock: 0 },
      ],
    },
    {
      name: 'Jaipur Turquoise Wave Leheriya Saree with Zari Border',
      slug: 'jaipur-turquoise-wave-leheriya-saree',
      description: 'A striking turquoise and royal blue multi-hued Leheriya saree on weightless pure chiffon fabric. Finished with authentic metallic Gota lace trimming and hand-twisted tassel drapes.',
      mrp: 6499,
      discountPercent: 15,
      sellingPrice: 5524,
      categoryId: categories['leheriya'].id,
      isNewArrival: false,
      isBestSeller: true,
      inStock: true,
      fabric: 'Pure Chiffon Silk',
      careInstructions: 'Dry Clean Only',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'Free Size', color: 'Turquoise Blue', colorHex: '#1E65B3', stock: 12 },
        { size: 'Free Size', color: 'Royal Pink', colorHex: '#E785B1', stock: 6 },
      ],
    },
    {
      name: 'Handcrafted Heritage Gota Patti Chanderi Kurti Set',
      slug: 'heritage-gota-patti-chanderi-kurti-set',
      description: 'Crafted in lustrous Chanderi silk blend, this straight kurti features heavy neck yoke Gota Patti work inspired by Amber Fort motifs. Accompanied by pants and a contrasting Bandhani print dupatta.',
      mrp: 5299,
      discountPercent: 25,
      sellingPrice: 3974,
      categoryId: categories['gota-patti'].id,
      isNewArrival: true,
      isBestSeller: false,
      inStock: true,
      fabric: 'Chanderi Silk & Cotton Silk Lining',
      careInstructions: 'Gentle Dry Clean Only',
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'XS', color: 'Ivory Gold', colorHex: '#C5A059', stock: 3 },
        { size: 'S', color: 'Ivory Gold', colorHex: '#C5A059', stock: 7 },
        { size: 'M', color: 'Ivory Gold', colorHex: '#C5A059', stock: 10 },
        { size: 'L', color: 'Ivory Gold', colorHex: '#C5A059', stock: 5 },
      ],
    },
    {
      name: 'Bagru Hand Block Printed Cotton Angrakha Kurti',
      slug: 'bagru-hand-block-printed-angrakha',
      description: 'Authentic Bagru natural dye hand-block printed cotton Angrakha flare kurti. Designed with side tie fabric strings, mirror detailing, and breathable 100% fine malmal cotton.',
      mrp: 3499,
      discountPercent: 30,
      sellingPrice: 2449,
      categoryId: categories['block-print'].id,
      isNewArrival: false,
      isBestSeller: true,
      inStock: true,
      fabric: '100% Premium Malmal Cotton',
      careInstructions: 'Handwash separately in cold water with mild detergent',
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'S', color: 'Indigo Blue', colorHex: '#1E65B3', stock: 8 },
        { size: 'M', color: 'Indigo Blue', colorHex: '#1E65B3', stock: 15 },
        { size: 'L', color: 'Indigo Blue', colorHex: '#1E65B3', stock: 9 },
        { size: 'XL', color: 'Indigo Blue', colorHex: '#1E65B3', stock: 4 },
      ],
    },
    {
      name: 'Kota Doria Golden Zari Check Saree',
      slug: 'kota-doria-golden-zari-check-saree',
      description: 'Elegance redefined in feather-light Kota Doria fabric woven with signature small khat check grids and shimmering golden zari borders.',
      mrp: 4799,
      discountPercent: 10,
      sellingPrice: 4319,
      categoryId: categories['kota-doria'].id,
      isNewArrival: true,
      isBestSeller: false,
      inStock: true,
      fabric: 'Pure Kota Doria Cotton Silk',
      careInstructions: 'Dry Clean Only',
      images: [
        'https://images.unsplash.com/photo-1583391733975-2313a4049a3a?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'Free Size', color: 'Blush Pink', colorHex: '#E785B1', stock: 10 },
        { size: 'Free Size', color: 'Royal Yellow', colorHex: '#C5A059', stock: 7 },
      ],
    },
    {
      name: 'Marwar Royal Velvet Heavy Bridal Dupatta',
      slug: 'marwar-royal-velvet-bridal-dupatta',
      description: 'A regal statement dupatta in rich micro-velvet adorned with traditional Marwari zardozi and Dabka embroidery bordering pure silk Bandhani center motif.',
      mrp: 7999,
      discountPercent: 20,
      sellingPrice: 6399,
      categoryId: categories['dupattas'].id,
      isNewArrival: true,
      isBestSeller: true,
      inStock: true,
      fabric: 'Micro Velvet & Bandhani Silk',
      careInstructions: 'Specialized Dry Clean Only',
      images: [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'Free Size', color: 'Deep Maroon', colorHex: '#832450', stock: 4 },
        { size: 'Free Size', color: 'Royal Blue', colorHex: '#1E65B3', stock: 3 },
      ],
    },
    {
      name: 'Sanganeri Print Tiered Festive Flared Kurti',
      slug: 'sanganeri-print-tiered-flared-kurti',
      description: 'A breezy multi-tiered flared kurti featuring authentic Sanganeri floral block motifs, delicate lace inserts, and comfortable quarter sleeves.',
      mrp: 2999,
      discountPercent: 15,
      sellingPrice: 2549,
      categoryId: categories['kurtis'].id,
      isNewArrival: false,
      isBestSeller: true,
      inStock: true,
      fabric: '100% Cambric Cotton',
      careInstructions: 'Machine wash cold on gentle cycle',
      images: [
        'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'S', color: 'Soft Coral Pink', colorHex: '#E785B1', stock: 12 },
        { size: 'M', color: 'Soft Coral Pink', colorHex: '#E785B1', stock: 18 },
        { size: 'L', color: 'Soft Coral Pink', colorHex: '#E785B1', stock: 10 },
        { size: 'XL', color: 'Soft Coral Pink', colorHex: '#E785B1', stock: 5 },
      ],
    },
    {
      name: 'Jodhpur Bandhej Silk Sharara Suit Set',
      slug: 'jodhpur-bandhej-silk-sharara-suit',
      description: 'Glamorous 3-piece Jodhpuri Sharara suit with a short flared kurti, wide pleated sharara pants, and a full heavy Bandhej chiffon dupatta with Gota fringes.',
      mrp: 9999,
      discountPercent: 25,
      sellingPrice: 7499,
      categoryId: categories['rajasthani-suits'].id,
      isNewArrival: true,
      isBestSeller: true,
      inStock: true,
      fabric: 'Pure Art Silk & Georgette Sharara',
      careInstructions: 'Dry Clean Only',
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop',
      ],
      variants: [
        { size: 'S', color: 'Royal Magenta Pink', colorHex: '#E785B1', stock: 6 },
        { size: 'M', color: 'Royal Magenta Pink', colorHex: '#E785B1', stock: 8 },
        { size: 'L', color: 'Royal Magenta Pink', colorHex: '#E785B1', stock: 4 },
      ],
    },
  ];

  for (const prodData of products) {
    const { images, variants, ...prod } = prodData;
    const createdProduct = await prisma.product.create({
      data: {
        ...prod,
        images: {
          create: images.map((url, idx) => ({ url, order: idx })),
        },
        variants: {
          create: variants,
        },
      },
    });

    // Create a sample review for best seller products
    if (prod.isBestSeller) {
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: customer.id,
          rating: 5,
          comment: 'Absolutely breathtaking craftsmanship! The Bandhani dot print is crisp and authentic. Recieved so many compliments during Teej celebrations.',
        },
      });
    }
  }

  console.log('✅ Products & Reviews created');

  // Promotions Banner
  await prisma.promotion.create({
    data: {
      title: 'ROYAL HERITAGE FESTIVE SALE',
      offerText: '✨ UP TO 30% OFF ON AUTHENTIC BANDHANI & GOTA PATTI COLLECTION ✨',
      description: 'Elevate your festive wardrobe with pure Jaipuri silk suits, hand-dyed Leheriya sarees, and heritage drapes.',
      bannerImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1200&auto=format&fit=crop',
      code: 'RAMYAA30',
      isActive: true,
    },
  });

  console.log('✅ Active Promotion created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
