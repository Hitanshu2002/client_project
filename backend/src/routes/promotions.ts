import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';

const router = Router();

// GET /api/promotions
router.get('/', async (req: Request, res: Response) => {
  try {
    const all = req.query.all as string | undefined;

    let promotions;
    if (all === 'true') {
      promotions = await prisma.promotion.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      promotions = await prisma.promotion.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.json({ promotions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// POST /api/promotions
router.post('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, offerText, bannerImage, code, startDate, endDate, isActive } = req.body;

    if (!title || !offerText) {
      return res.status(400).json({ error: 'Title and offer text are required' });
    }

    const promo = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        offerText,
        bannerImage: bannerImage || null,
        code: code || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return res.status(201).json({ promotion: promo, message: 'Promotion created' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// PUT /api/promotions/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, description, offerText, bannerImage, code, startDate, endDate, isActive } = req.body;

    const promo = await prisma.promotion.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        description: description !== undefined ? description : undefined,
        ...(offerText && { offerText }),
        bannerImage: bannerImage !== undefined ? bannerImage : undefined,
        code: code !== undefined ? code : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
      },
    });

    return res.json({ promotion: promo, message: 'Promotion updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update promotion' });
  }
});

// DELETE /api/promotions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.promotion.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Promotion deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete promotion' });
  }
});

export default router;
