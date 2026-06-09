import { PrismaClient, Role } from '../../generated/prisma/client';
import argon2 from 'argon2';

export async function seedAdmins(prisma: PrismaClient) {
  const email = 'admin@gmail.com';
  const password = 'admin123';

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  const hashedPassword = await argon2.hash(password, {
    type: argon2.argon2id,
  });

  if (existing) {
    const passwordMatches = await argon2
      .verify(existing.password, password)
      .catch(() => false);

    if (!passwordMatches || existing.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: passwordMatches ? existing.password : hashedPassword,
          role: Role.ADMIN,
        },
      });
    }

    await prisma.profile.upsert({
      where: { userId: existing.id },
      create: {
        userId: existing.id,
        rating: 0,
      },
      update: {},
    });

    console.log('[seed] Admin verified:', existing.email);
    return;
  }

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
    },
  });

  console.log('[seed] Admin created:', admin.email);
}
