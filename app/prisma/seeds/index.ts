import { PrismaClient } from '../../generated/prisma/client';
import { seedAdmins } from './admins';

export async function runSeeds(prisma: PrismaClient) {
  await seedAdmins(prisma);
}
