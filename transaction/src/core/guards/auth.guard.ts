import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClientAuthGuard implements CanActivate {
  public constructor(
    @Inject('TOKEN_SERVICE') private readonly client: ClientProxy,
  ) {
    this.client.connect();
  }

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.getArgByIndex(0);
      const Authorization = request.headers['authorization'];
      const token = Authorization.replace('Bearer ', '');
      const decode = await firstValueFrom(
        this.client.send('token_decode', token),
      );

      if (!decode) {
        throw new HttpException('ACCESS_DENIED', HttpStatus.UNAUTHORIZED);
      }
      request.userId = decode.userId;
      return true;
    } catch (e) {
      console.log(e);
      throw new HttpException('ACCESS_DENIED', HttpStatus.UNAUTHORIZED);
    }
  }
}
