import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const all = searchParams.get('all');

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

    return NextResponse.json({ promotions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, offerText, bannerImage, code, startDate, endDate, isActive } = body;

    if (!title || !offerText) {
      return NextResponse.json({ error: 'Title and offer text are required' }, { status: 400 });
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

    return NextResponse.json({ promotion: promo, message: 'Promotion created' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 });
  }
}
