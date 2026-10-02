import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice, slugify } from '@/lib/utils';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('q');
    const isNewArrival = searchParams.get('isNewArrival');
    const isBestSeller = searchParams.get('isBestSeller');
    const sort = searchParams.get('sort'); // price-asc | price-desc | newest
    const size = searchParams.get('size');
    const color = searchParams.get('color');

    const where: any = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isNewArrival === 'true') {
      where.isNewArrival = true;
    }

    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { category: { name: { contains: search } } },
        { fabric: { contains: search } },
      ];
    }

    if (size || color) {
      where.variants = {
        some: {
          ...(size ? { size } : {}),
          ...(color ? { color } : {}),
          stock: { gt: 0 },
        },
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (sort === 'price-desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    const formattedProducts = products.map((product) => {
      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
          : 0;

      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      };
    });

    return NextResponse.json({ products: formattedProducts });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      description,
      mrp,
      discountPercent,
      categoryId,
      isNewArrival,
      isBestSeller,
      isFestive,
      inStock,
      fabric,
      careInstructions,
      images,
      variants,
    } = body;

    if (!name || !description || mrp === undefined || !categoryId) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const numMrp = parseFloat(mrp);
    const numDiscount = parseFloat(discountPercent || 0);
    const sellingPrice = calculateSellingPrice(numMrp, numDiscount);
    const baseSlug = slugify(name);
    let slug = baseSlug;
    let count = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        mrp: numMrp,
        discountPercent: numDiscount,
        sellingPrice,
        categoryId,
        isNewArrival: Boolean(isNewArrival),
        isBestSeller: Boolean(isBestSeller),
        isFestive: Boolean(isFestive),
        inStock: inStock !== undefined ? Boolean(inStock) : true,
        fabric: fabric || null,
        careInstructions: careInstructions || null,
        images: {
          create: (images || []).map((url: string, index: number) => ({
            url,
            order: index,
          })),
        },
        variants: {
          create: (variants || []).map((v: any) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex || null,
            stock: parseInt(v.stock || 0),
          })),
        },
      },
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product: newProduct, message: 'Product created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
