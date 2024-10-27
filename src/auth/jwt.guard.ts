import { Injectable, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RedisService } from '../database/services/redis.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(@Inject() private readonly redisService: RedisService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    await super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (token && (await this.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    return true;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return !!(await this.redisService.getClient().get(token));
  }
}
