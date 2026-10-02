import path from 'path';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL?.startsWith('file:')
  ? `file:${path.resolve(__dirname, '../../../frontend/prisma/dev.db')}`
  : process.env.DATABASE_URL;

export const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
