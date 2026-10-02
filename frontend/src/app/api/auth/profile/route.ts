import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthTokenFromRequest, verifyToken, signToken, TOKEN_NAME } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  try {
    const token = getAuthTokenFromRequest(req);
    const authUser = token ? verifyToken(token) : null;

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, email } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const updateData: any = { name };
    if (phone !== undefined) updateData.phone = phone || null;

    if (email && email.toLowerCase().trim() !== authUser.email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return NextResponse.json({ error: 'Email address is already in use by another account' }, { status: 400 });
      }
      updateData.email = cleanEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    });

    // Re-sign token with updated info
    const tokenPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as 'CUSTOMER' | 'ADMIN',
      name: updatedUser.name,
    };
    const newToken = signToken(tokenPayload);

    const userObj = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      createdAt: updatedUser.createdAt,
    };

    const response = NextResponse.json({ user: userObj, message: 'Profile updated successfully' });
    response.cookies.set({
      name: TOKEN_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
