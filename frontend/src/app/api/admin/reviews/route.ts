import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
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

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Fetch admin reviews error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, rating, comment, customAuthorName } = body;

    if (!productId || !rating || !comment || !customAuthorName) {
      return NextResponse.json(
        { error: 'Product, rating (1-5), comment, and custom reviewer name are required.' },
        { status: 400 }
      );
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 });
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

    return NextResponse.json({ review: newReview, message: 'Admin review created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Create admin review error:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
