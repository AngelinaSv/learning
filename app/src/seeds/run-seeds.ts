import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { seedRoles } from './roles.seed';
import { seedAdmin } from './admin.seed';

async function run() {
  const dataSource: DataSource = await AppDataSource.initialize();

  await seedRoles(dataSource);
  await seedAdmin(dataSource);

  await dataSource.destroy();
}

run();
