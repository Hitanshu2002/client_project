import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    const totalUsers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });

    const pendingPayments = await prisma.order.count({
      where: { paymentStatus: 'PENDING_VERIFICATION' },
    });

    const confirmedOrders = await prisma.order.findMany({
      where: { paymentStatus: 'CONFIRMED' },
      select: { totalAmount: true },
    });

    const totalRevenue = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const lowStockVariants = await prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      select: { productId: true },
    });

    const lowStockProductIds = Array.from(new Set(lowStockVariants.map((v) => v.productId)));
    const lowStockCount = lowStockProductIds.length;

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
      },
    });

    return res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        pendingPayments,
        lowStockCount,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true },
        },
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
    });

    const formattedUsers = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      createdAt: u.createdAt,
      orderCount: u._count.orders,
      reviewCount: u._count.reviews,
      totalSpent: u.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    return res.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/reviews
router.get('/reviews', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({ reviews });
  } catch (error) {
    console.error('Fetch admin reviews error:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/admin/reviews
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    const { productId, rating, comment, customAuthorName } = req.body;

    if (!productId || !rating || !comment || !customAuthorName) {
      return res.status(400).json({
        error: 'Product, rating (1-5), comment, and custom reviewer name are required.',
      });
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.userId,
        customAuthorName: customAuthorName.trim(),
        rating: numRating,
        comment: comment.trim(),
      },
      include: {
        product: { select: { name: true } },
        user: { select: { name: true } },
      },
    });

    return res.status(201).json({ review: newReview, message: 'Admin review created successfully' });
  } catch (error: any) {
    console.error('Create admin review error:', error);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized. Admin access required.' });
    }

    await prisma.review.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
