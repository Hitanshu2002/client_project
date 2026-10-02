import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idOrOrderNum = params.id;

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
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    const body = await req.json();
    const { paymentRef, paymentStatus, orderStatus, courierName, trackingNumber } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Customer marking payment completed
    if (paymentRef && !user?.role) {
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: {
          paymentRef,
          paymentStatus: 'PENDING_VERIFICATION',
        },
      });
      return NextResponse.json({ order: updated, message: 'Payment reference submitted' });
    }

    // Admin updating statuses
    if (user?.role === 'ADMIN') {
      const updateData: any = {};
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (courierName !== undefined) updateData.courierName = courierName;
      if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
      if (paymentRef !== undefined) updateData.paymentRef = paymentRef;

      // If payment is confirmed, update orderStatus to CONFIRMED if it was PENDING
      if (paymentStatus === 'CONFIRMED' && existingOrder.orderStatus === 'PENDING') {
        updateData.orderStatus = 'CONFIRMED';
      }

      const updated = await prisma.order.update({
        where: { id: params.id },
        data: updateData,
      });

      return NextResponse.json({ order: updated, message: 'Order status updated successfully' });
    }

    // Customer updating payment reference for their own order
    if (user?.role === 'CUSTOMER' && existingOrder.userId === user.userId && paymentRef) {
      const updated = await prisma.order.update({
        where: { id: params.id },
        data: {
          paymentRef,
          paymentStatus: 'PENDING_VERIFICATION',
        },
      });
      return NextResponse.json({ order: updated, message: 'Payment reference recorded' });
    }

    return NextResponse.json({ error: 'Unauthorized to update order' }, { status: 403 });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
