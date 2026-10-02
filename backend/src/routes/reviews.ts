import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

// GET /api/reviews
router.get('/', async (req: Request, res: Response) => {
  try {
    const productId = req.query.productId as string | undefined;

    if (!productId) {
      return res.status(400).json({ error: 'productId parameter is required' });
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews
router.post('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'You must be logged in to submit a review' });
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating (1-5), and comment are required' });
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 stars' });
    }

    const qualifyingOrder = await prisma.order.findFirst({
      where: {
        userId: user.userId,
        items: {
          some: { productId },
        },
        orderStatus: { in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] },
      },
    });

    if (!qualifyingOrder) {
      return res.status(403).json({
        error: 'Verified Purchase Required: You can only submit a review for products you have purchased and had confirmed/delivered.',
      });
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: user.userId,
      },
    });

    if (existingReview) {
      const updated = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating: numRating,
          comment,
        },
      });
      return res.json({ review: updated, message: 'Your verified review has been updated' });
    }

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: user.userId,
        rating: numRating,
        comment,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return res.status(201).json({ review: newReview, message: 'Verified review submitted successfully' });
  } catch (error: any) {
    console.error('Review error:', error);
    return res.status(500).json({ error: 'Failed to submit review' });
  }
});

// DELETE /api/reviews/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const review = await prisma.review.findUnique({ where: { id: req.params.id } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    if (user.role !== 'ADMIN' && review.userId !== user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this review' });
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
