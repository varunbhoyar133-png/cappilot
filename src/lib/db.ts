import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | null = null;

// Use a JavaScript Proxy to implement lazy initialization of PrismaClient
// with the Prisma 7 driver adapter pattern.
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prismaInstance) {
      if (globalForPrisma.prisma) {
        prismaInstance = globalForPrisma.prisma;
      } else {
        const pool = new Pool({
          connectionString: process.env.DATABASE_URL
        });
        const adapter = new PrismaPg(pool);
        prismaInstance = new PrismaClient({ adapter });
        if (process.env.NODE_ENV !== 'production') {
          globalForPrisma.prisma = prismaInstance;
        }
      }
    }
    return (prismaInstance as any)[prop];
  }
});

export default prisma;
