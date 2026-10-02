import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { calculateSellingPrice, slugify } from '../lib/utils';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const categorySlug = req.query.category as string | undefined;
    const search = req.query.q as string | undefined;
    const isNewArrival = req.query.isNewArrival as string | undefined;
    const isBestSeller = req.query.isBestSeller as string | undefined;
    const sort = req.query.sort as string | undefined;
    const size = req.query.size as string | undefined;
    const color = req.query.color as string | undefined;

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

    return res.json({ products: formattedProducts });
  } catch (error: any) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/products
router.post('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

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
    } = req.body;

    if (!name || !description || mrp === undefined || !categoryId) {
      return res.status(400).json({ error: 'Missing required product fields' });
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

    return res.status(201).json({ product: newProduct, message: 'Product created successfully' });
  } catch (error: any) {
    console.error('Create product error:', error);
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id;

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
      return res.status(404).json({ error: 'Product not found' });
    }

    const avgRating =
      product.reviews.length > 0
        ? product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length
        : 0;

    return res.json({
      product: {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: product.reviews.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch product detail' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

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
    } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const numMrp = mrp !== undefined ? parseFloat(mrp) : existingProduct.mrp;
    const numDiscount = discountPercent !== undefined ? parseFloat(discountPercent) : existingProduct.discountPercent;
    const sellingPrice = calculateSellingPrice(numMrp, numDiscount);

    await prisma.product.update({
      where: { id: req.params.id },
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

    if (images && Array.isArray(images)) {
      await prisma.productImage.deleteMany({ where: { productId: req.params.id } });
      await prisma.productImage.createMany({
        data: images.map((url: string, index: number) => ({
          productId: req.params.id,
          url,
          order: index,
        })),
      });
    }

    if (variants && Array.isArray(variants)) {
      await prisma.productVariant.deleteMany({ where: { productId: req.params.id } });
      await prisma.productVariant.createMany({
        data: variants.map((v: any) => ({
          productId: req.params.id,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || null,
          stock: parseInt(v.stock || 0),
        })),
      });
    }

    const fullProduct = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });

    return res.json({ product: fullProduct, message: 'Product updated successfully' });
  } catch (error: any) {
    console.error('Update product error:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await prisma.orderItem.updateMany({
      where: { productId: req.params.id },
      data: { productId: null },
    });

    await prisma.product.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return res.status(500).json({ error: 'Failed to delete product', detail: error.message });
  }
});

export default router;
