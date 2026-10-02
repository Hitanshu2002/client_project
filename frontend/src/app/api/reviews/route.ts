import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'productId parameter is required' }, { status: 400 });
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

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const user = token ? verifyToken(token) : null;

    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to submit a review' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body;

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: 'Product ID, rating (1-5), and comment are required' }, { status: 400 });
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5 stars' }, { status: 400 });
    }

    // SERVER-SIDE PURCHASE VERIFICATION CHECK:
    // User must have at least one Order containing this productId where orderStatus is 'DELIVERED' or 'CONFIRMED' or 'SHIPPED'
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
      return NextResponse.json(
        {
          error: 'Verified Purchase Required: You can only submit a review for products you have purchased and had confirmed/delivered.',
        },
        { status: 403 }
      );
    }

    // Check if user already reviewed this product
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
      return NextResponse.json({ review: updated, message: 'Your verified review has been updated' });
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

    return NextResponse.json({ review: newReview, message: 'Verified review submitted successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
