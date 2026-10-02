import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();

    // Total registered customers on the website
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

    return NextResponse.json({
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
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
