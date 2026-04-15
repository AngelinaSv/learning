import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from 'src/user/types/user.type';

interface RequestWithUser {
  body: {
    email: string;
    password: string;
  };
  user?: User;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const query = (req as any).query || {};
    const body = req.body || {};

    let email = body.email || query.email;
    let password = body.password || query.password;

    // For multipart FormData, multer puts text fields directly in body
    if (!email && body.email) email = body.email;
    if (!password && body.password) password = body.password;

    if (!email || !password) {
      throw new UnauthorizedException('No credentials');
    }

    const user = await this.authService.validateUser({ email, password });

    (req as any).user = user;

    return true;
  }
}
