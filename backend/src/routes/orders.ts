import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '../lib/auth';
import { activePaymentProvider } from '../lib/payment';

const router = Router();

// GET /api/orders
router.get('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const orderStatus = req.query.orderStatus as string | undefined;
    const paymentStatus = req.query.paymentStatus as string | undefined;

    let where: any = {};

    if (user?.role === 'ADMIN') {
      if (orderStatus) where.orderStatus = orderStatus;
      if (paymentStatus) where.paymentStatus = paymentStatus;
    } else if (user?.role === 'CUSTOMER') {
      where.userId = user.userId;
    } else {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    return res.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const { customerName, customerEmail, customerPhone, address, city, state, pincode, items } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !city || !state || !pincode || !items || !items.length) {
      return res.status(400).json({ error: 'Complete delivery details and items are required' });
    }

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.inStock) {
        return res.status(400).json({ error: `Product ${item.productName || 'item'} is currently out of stock.` });
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name} (${item.size} / ${item.color}). Only ${variant.stock} available.`,
        });
      }

      const itemTotal = product.sellingPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        variantId: item.variantId || null,
        productName: product.name,
        size: item.size || 'Free Size',
        color: item.color || 'Standard',
        price: product.sellingPrice,
        quantity: item.quantity,
      });
    }

    const shippingCharge = calculatedSubtotal >= 2999 || calculatedSubtotal === 0 ? 0 : 150;
    const totalAmount = calculatedSubtotal + shippingCharge;

    const count = await prisma.order.count();
    const orderNumber = `RAMYAA-2026-${1000 + count + 1}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.userId : null,
        customerName,
        customerEmail: customerEmail.toLowerCase().trim(),
        customerPhone,
        address,
        city,
        state,
        pincode,
        subtotal: calculatedSubtotal,
        shippingCharge,
        totalAmount,
        paymentStatus: 'PENDING_VERIFICATION',
        orderStatus: 'PENDING',
        items: {
          create: validatedItems,
        },
      },
      include: {
        items: true,
      },
    });

    for (const item of validatedItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    const paymentDetails = await activePaymentProvider.generatePaymentDetails(orderNumber, totalAmount);

    return res.status(201).json({
      order,
      paymentDetails,
      message: 'Order created successfully. Please complete manual UPI payment.',
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idOrOrderNum = req.params.id;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: idOrOrderNum }, { orderNumber: idOrOrderNum }],
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { orderBy: { order: 'asc' }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({ order });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// PUT /api/orders/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const { paymentRef, paymentStatus, orderStatus, courierName, trackingNumber } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: req.params.id },
    });

    if (!existingOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (paymentRef && !user?.role) {
      const updated = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          paymentRef,
          paymentStatus: 'PENDING_VERIFICATION',
        },
      });
      return res.json({ order: updated, message: 'Payment reference submitted' });
    }

    if (user?.role === 'ADMIN') {
      const updateData: any = {};
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (courierName !== undefined) updateData.courierName = courierName;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (paymentRef !== undefined) updateData.paymentRef = paymentRef;

      if (paymentStatus === 'CONFIRMED' && existingOrder.orderStatus === 'PENDING') {
        updateData.orderStatus = 'CONFIRMED';
      }

      const updated = await prisma.order.update({
        where: { id: req.params.id },
        data: updateData,
      });

      return res.json({ order: updated, message: 'Order status updated successfully' });
    }

    if (user?.role === 'CUSTOMER' && existingOrder.userId === user.userId && paymentRef) {
      const updated = await prisma.order.update({
        where: { id: req.params.id },
        data: {
          paymentRef,
          paymentStatus: 'PENDING_VERIFICATION',
        },
      });
      return res.json({ order: updated, message: 'Payment reference recorded' });
    }

    return res.status(403).json({ error: 'Unauthorized to update order' });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

export default router;
