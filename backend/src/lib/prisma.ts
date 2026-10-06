import path from 'path';
import { PrismaClient } from '@prisma/client';

const configuredDatabaseUrl = process.env.DATABASE_URL;
const databaseUrl = configuredDatabaseUrl?.startsWith('file:')
  ? path.isAbsolute(configuredDatabaseUrl.slice(5))
    ? configuredDatabaseUrl
    : `file:${path.resolve(process.cwd(), configuredDatabaseUrl.slice(5))}`
  : configuredDatabaseUrl;

export const prisma = new PrismaClient({
  datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
