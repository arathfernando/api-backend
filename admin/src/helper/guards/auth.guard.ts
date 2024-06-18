import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  excludedRequests = [
    '/v1/api/admin/login',
    '/v1/api/admin/signup',
    '/v1/api/admin/change-password',
    '/v1/api/admin/forgot-password',
    '/v1/api/admin/investor/grab-share',
    '/v1/api/admin/options/contest-category',
    '/v1/api/admin/options/open/course-category',
    '/v1/api/admin/options/open/translation-language',
    '/v1/api/admin/open/options/country',
    '/v1/api/admin/open/options/language',
  ];
  public constructor(
    @Inject('TOKEN_SERVICE') private readonly client: ClientProxy,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.getArgByIndex(0);

      if (context.getType() === 'rpc') {
        return true;
      }

      if (
        context.getType() != 'rpc' &&
        this.excludedRequests.includes(request.url.split('?')[0])
      ) {
        return true;
      }

      const Authorization = request.headers['authorization'];
      if (!Authorization) {
        return false;
      }
      const token = Authorization.replace('Bearer ', '');
      await this.client.connect();
      const decode = await firstValueFrom(
        this.client.send('token_decode', token),
      );
      if (!decode) {
        throw new UnauthorizedException('INVALID_ACCESS');
      }
      request.userId = decode.userId;
      return true;
    } catch (e) {
      console.log('Err guard -->', e);
      return false;
    }
  }
}
