import { UserRole } from '../enums/user-role.enum';

export const RoleToDb: Record<UserRole, number> = {
  [UserRole.ADMIN]: 0,
  [UserRole.USER]: 1,
};

export const DbToRole: Record<number, UserRole> = {
  0: UserRole.ADMIN,
  1: UserRole.USER,
};
