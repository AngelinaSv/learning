import { SetMetadata } from '@nestjs/common';
import { CustomDecorator } from '@nestjs/common/decorators';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
