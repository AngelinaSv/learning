import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface CurrentUserPayload {
  sub?: string;
}

interface CurrentUserRequest {
  user?: CurrentUserPayload;
}

export const GetCurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CurrentUserRequest>();
    return request.user?.sub;
  },
);
