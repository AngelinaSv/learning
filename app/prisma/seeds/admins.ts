import { PrismaClient, Role } from '../../generated/prisma/client';
import argon2 from 'argon2';

export async function seedAdmins(prisma: PrismaClient) {
  const email = 'admin@gmail.com';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log('[seed] Admin already exists');
    return;
  }

  const hashedPassword = await argon2.hash('admin123', {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  await prisma.profile.create({
    data: {
      userId: admin.id,
      rating: 0,
      balance: 0,
    },
  });

  console.log('[seed] Admin created:', admin.email);
}
