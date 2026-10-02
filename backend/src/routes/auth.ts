import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  getAuthTokenFromRequest,
  TOKEN_NAME,
} from '../lib/auth';
import { sendOtpEmail } from '../lib/email';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'CUSTOMER' | 'ADMIN',
      name: user.name,
    };

    const token = signToken(tokenPayload);

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
    });

    return res.json({ user: userObj, message: 'Logged in successfully' });
  } catch (error: any) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        phone: phone || null,
        role: 'CUSTOMER',
      },
    });

    const tokenPayload = {
      userId: newUser.id,
      email: newUser.email,
      role: 'CUSTOMER' as const,
      name: newUser.name,
    };

    const token = signToken(tokenPayload);

    const userObj = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };

    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ user: userObj, message: 'Account registered successfully' });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(TOKEN_NAME, {
    httpOnly: true,
    path: '/',
  });
  return res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return res.json({ user: null });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        createdAt: true,
      },
    });

    return res.json({ user: dbUser });
  } catch (error) {
    return res.status(500).json({ user: null, error: 'Failed to fetch user profile' });
  }
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.otpVerification.upsert({
      where: { email: cleanEmail },
      update: { code, expiresAt },
      create: { email: cleanEmail, code, expiresAt },
    });

    await sendOtpEmail(cleanEmail, code);

    return res.json({
      message: `Verification code sent to ${cleanEmail}`,
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const record = await prisma.otpVerification.findUnique({
      where: { email: cleanEmail },
    });

    if (!record) {
      return res.status(400).json({ error: 'No verification code found for this email. Please request a code.' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    if (record.code !== code.trim()) {
      return res.status(400).json({ error: 'Incorrect verification code. Please try again.' });
    }

    return res.json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = getAuthTokenFromRequest(req);
    const authUser = token ? verifyToken(token) : null;

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in.' });
    }

    const { name, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const updateData: any = { name };
    if (phone !== undefined) updateData.phone = phone || null;

    if (email && email.toLowerCase().trim() !== authUser.email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(400).json({ error: 'Email address is already in use by another account' });
      }
      updateData.email = cleanEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
    });

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

    res.cookie(TOKEN_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ user: userObj, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update Profile Error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
