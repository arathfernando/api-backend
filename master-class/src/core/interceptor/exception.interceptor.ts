import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter<HttpException> {
  constructor(private readonly i18n: I18nService) {}
  async catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    if (message) {
      const lang = request.headers['accept-language'] || 'en';
      const trans_message = await this.i18n.t(`errors.${message}`, {
        lang,
      });
      if (message.includes('ERROR')) {
        message = exception.message;
      } else {
        message = trans_message;
      }
    } else {
      message = 'Internal server error';
    }
    response.status(statusCode).json({
      statusCode,
      message,
    });
  }
}
