import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserDto {
  userId: string;
  organizationId: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as CurrentUserDto;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
