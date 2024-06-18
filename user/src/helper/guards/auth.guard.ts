import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/database/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  excludedRequests = [
    '/v1/api/auth/login',
    '/v1/api/auth/signup',
    '/v1/api/auth/signup/linkedin',
    '/v1/api/auth/signup/mobile/linkedin',
    '/v1/api/auth/signup/mobile/apple',
    '/v1/api/auth/forgot-password',
    '/v1/api/auth/verify-account',
    '/v1/api/auth/get-verification-code',
    '/v1/api/partner/open/partners/language',
    '/v1/api/auth/change-password',
    '/v1/api/user/hubber-team',
    '/v1/api/user/community-host',
    '/v1/api/user/hubber-users',
    '/v1/api/partner/view/data',
    '/v1/api/user/goals',
    '/v1/api/user/popular-contest',
    '/v1/api/partner/view/partners',
    '/v1/api/profile/investor/open/count',
  ];
  public constructor(
    @Inject('TOKEN_SERVICE') private readonly client: ClientProxy,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.getArgByIndex(0);
      if (this.excludedRequests.includes(request.url.split('?')[0])) {
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

      const user = await this.findUserAccountByEmail(decode.email);

      request.account_settings = user.account_settings;
      request.userId = decode.userId;
      return true;
    } catch (e) {
      console.log('Err guard -->', e);
      return false;
    }
  }

  public async findUserAccountByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOne({
        relations: [
          'general_profile',
          'account_settings',
          'account_settings.setting',
        ],
        where: {
          email,
        },
      });
    } catch (err) {
      throw err;
    }
  }
}
