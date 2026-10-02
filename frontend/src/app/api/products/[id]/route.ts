import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateSellingPrice } from '@/lib/utils';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idOrSlug = params.id;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
        reviews: {
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    return NextResponse.json({
      product: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch product detail' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const numMrp = mrp !== undefined ? parseFloat(mrp) : existingProduct.mrp;
    const numDiscount = discountPercent !== undefined ? parseFloat(discountPercent) : existingProduct.discountPercent;
    const sellingPrice = calculateSellingPrice(numMrp, numDiscount);

    // Update main product details
    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        mrp: numMrp,
        discountPercent: numDiscount,
        sellingPrice,
        ...(categoryId && { categoryId }),
        ...(isNewArrival !== undefined && { isNewArrival: Boolean(isNewArrival) }),
        ...(isBestSeller !== undefined && { isBestSeller: Boolean(isBestSeller) }),
        ...(isFestive !== undefined && { isFestive: Boolean(isFestive) }),
        ...(inStock !== undefined && { inStock: Boolean(inStock) }),
        fabric: fabric !== undefined ? fabric : existingProduct.fabric,
        careInstructions: careInstructions !== undefined ? careInstructions : existingProduct.careInstructions,
      },
    });

    // Update images if supplied
    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: params.id } });
      await prisma.productImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: params.id,
          url,
          order: index,
        })),
      });
    }

    // Update variants if supplied
    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: params.id } });
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: params.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: parseInt(v.stock || 0),
        })),
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });

    return NextResponse.json({ product: fullProduct, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: params.id } });
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Detach product from order items to avoid FK constraint error
    // (OrderItems keep their productName/price/color/size as historical record)
    await prisma.orderItem.updateMany({
      where: { productId: params.id },
      data: { productId: null },
    });

    // Now safe to delete — cascades will handle ProductImage, ProductVariant, Review
    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Failed to delete product', detail: error.message }, { status: 500 });
  }
}
