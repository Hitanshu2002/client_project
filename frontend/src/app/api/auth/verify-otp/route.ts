import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const record = await prisma.otpVerification.findUnique({
      where: { email: cleanEmail },
    });

    if (!record) {
      return NextResponse.json({ error: 'No verification code found for this email. Please request a code.' }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
    }

    if (record.code !== code.trim()) {
      return NextResponse.json({ error: 'Incorrect verification code. Please try again.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
