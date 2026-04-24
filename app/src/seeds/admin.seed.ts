import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user/entities/user.entity';
import { Role } from '../access/role/entities/role.entity';

export const seedAdmin = async (dataSource: DataSource) => {
  const userRepo = dataSource.getRepository(User);
  const roleRepo = dataSource.getRepository(Role);

  const existingAdmin = await userRepo.findOneBy({
    email: 'admin@example.com',
  });

  if (existingAdmin) {
    console.log('Admin already exists');
    return;
  }

  const adminRole = await roleRepo.findOneBy({ name: 'ADMIN' });

  if (!adminRole) {
    throw new Error('ADMIN role not found. Run roles seed first.');
  }

  const password = await bcrypt.hash('admin123', 10);

  const admin = userRepo.create({
    email: 'admin@example.com',
    password,
    firstName: 'Admin',
    lastName: 'User',
    quota: 1073741824,
    roles: [adminRole],
  });

  await userRepo.save(admin);

  console.log('Admin user created');
};
