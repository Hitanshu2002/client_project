import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';
import { activePaymentProvider } from '@/lib/payment';

export async function GET(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const { searchParams } = new URL(req.url);
    const orderStatus = searchParams.get('orderStatus');
    const paymentStatus = searchParams.get('paymentStatus');

    let where: any = {};

    if (user?.role === 'ADMIN') {
      if (orderStatus) where.orderStatus = orderStatus;
      if (paymentStatus) where.paymentStatus = paymentStatus;
    } else if (user?.role === 'CUSTOMER') {
      where.userId = user.userId;
    } else {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const body = await req.json();
    const { customerName, customerEmail, customerPhone, address, city, state, pincode, items } = body;

    if (!customerName || !customerEmail || !customerPhone || !address || !city || !state || !pincode || !items || !items.length) {
      return NextResponse.json({ error: 'Complete delivery details and items are required' }, { status: 400 });
    }

    // 1. Verify product prices & variant stock server-side
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });

      if (!product || !product.inStock) {
        return NextResponse.json({ error: `Product ${item.productName || 'item'} is currently out of stock.` }, { status: 400 });
      }

      const variant = product.variants.find((v) => v.id === item.variantId);
      if (variant && variant.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name} (${item.size} / ${item.color}). Only ${variant.stock} available.` },
          { status: 400 }
        );
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

    // 2. Shipping calculation
    const shippingCharge = calculatedSubtotal >= 2999 || calculatedSubtotal === 0 ? 0 : 150;
    const totalAmount = calculatedSubtotal + shippingCharge;

    // 3. Generate Order Number
    const count = await prisma.order.count();
    const orderNumber = `RAMYAA-2026-${1000 + count + 1}`;

    // 4. Create Order in Database
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

    // 5. Decrement stock for ordered variants
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

    // 6. Generate Payment Details via active Payment Provider
    const paymentDetails = await activePaymentProvider.generatePaymentDetails(orderNumber, totalAmount);

    return NextResponse.json(
      {
        order,
        paymentDetails,
        message: 'Order created successfully. Please complete manual UPI payment.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
