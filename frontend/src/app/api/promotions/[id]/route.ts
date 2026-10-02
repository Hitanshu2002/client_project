import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, offerText, bannerImage, code, startDate, endDate, isActive } = body;

    const promo = await prisma.promotion.update({
      where: { id: params.id },
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

    return NextResponse.json({ promotion: promo, message: 'Promotion updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update promotion' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.promotion.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Promotion deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete promotion' }, { status: 500 });
  }
}
