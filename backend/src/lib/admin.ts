import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'houseoframyaa@gmail.com').toLowerCase().trim();
export const ADMIN_TEMP_PASSWORD = process.env.ADMIN_TEMP_PASSWORD || 'Admin@123456';

/** Keeps exactly one admin account and creates the canonical account on first boot. */
export async function ensureAdminAccount() {
  const canonicalUser = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  const canonicalAdmin = canonicalUser?.role === 'ADMIN' ? canonicalUser : null;
  const otherAdmins = await prisma.user.findMany({
    where: { role: 'ADMIN', ...(canonicalAdmin ? { id: { not: canonicalAdmin.id } } : {}) },
    orderBy: { createdAt: 'asc' },
  });

  if (canonicalAdmin) {
    if (otherAdmins.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: otherAdmins.map((user) => user.id) } },
        data: { role: 'CUSTOMER' },
      });
    }
    return canonicalAdmin;
  }

  const passwordHash = await bcrypt.hash(ADMIN_TEMP_PASSWORD, 10);
  const sourceAdmin = otherAdmins[0];
  const admin = canonicalUser
    ? await prisma.user.update({
        where: { id: canonicalUser.id },
        data: {
          name: 'House of Ramyaa Admin',
          passwordHash,
          role: 'ADMIN',
        },
      })
    : sourceAdmin
    ? await prisma.user.update({
        where: { id: sourceAdmin.id },
        data: {
          email: ADMIN_EMAIL,
          name: 'House of Ramyaa Admin',
          passwordHash,
          role: 'ADMIN',
        },
      })
    : await prisma.user.create({
        data: {
          name: 'House of Ramyaa Admin',
          email: ADMIN_EMAIL,
          passwordHash,
          role: 'ADMIN',
        },
      });

  if (otherAdmins.length > 1) {
    await prisma.user.updateMany({
      where: { id: { in: otherAdmins.slice(1).map((user) => user.id) } },
      data: { role: 'CUSTOMER' },
    });
  }

  console.log(`Admin account ready: ${ADMIN_EMAIL}`);
  return admin;
}
