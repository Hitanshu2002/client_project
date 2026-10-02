import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { slugify } from '../lib/utils';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

// GET /api/categories
router.get('/', async (req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      ...cat,
      productCount: cat._count.products,
    }));

    return res.json({ categories: formatted });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories
router.post('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, description, image } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const slug = slugify(name);

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
      },
    });

    return res.status(201).json({ category, message: 'Category created' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idOrSlug = req.params.id;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        _count: {
          select: { products: true },
        },
        products: {
          include: {
            images: { orderBy: { order: 'asc' } },
            variants: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.json({
      category: {
        ...category,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch category detail' });
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, description, image } = req.body;

    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        description: description !== undefined ? description : category.description,
        image: image !== undefined ? image : category.image,
      },
    });

    return res.json({ category: updated, message: 'Category updated' });
  } catch (error: any) {
    console.error('Update category error:', error);
    return res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const category = await prisma.category.findUnique({ where: { id: req.params.id } });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const productCount = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (productCount > 0) {
      return res.status(409).json({
        error: 'Cannot delete: ' + productCount + ' product(s) are in this category. Delete those products first.',
      });
    }

    await prisma.category.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    console.error('Delete category error:', error);
    return res.status(500).json({ error: 'Failed to delete category', detail: error.message });
  }
});

export default router;
