import { DataSource } from 'typeorm';
import { Role } from '../access/role/entities/role.entity';

export const seedRoles = async (dataSource: DataSource) => {
  const roleRepo = dataSource.getRepository(Role);

  const roles = ['USER', 'ADMIN'];

  for (const name of roles) {
    const exists = await roleRepo.findOneBy({ name });

    if (!exists) {
      await roleRepo.save(roleRepo.create({ name }));
      console.log(`Role created: ${name}`);
    }
  }
};
