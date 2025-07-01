/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/common/filters/global-api-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponseHelper, CustomApiError } from '../api-response';

@Catch()
export class GlobalApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Default-Werte
    let statusCode = 500;
    let message = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exRes = exception.getResponse();
      if (typeof exRes === 'string') {
        message = exRes;
        errorType = exception.name;
      } else if (typeof exRes === 'object' && exRes !== null) {
        message = (exRes as any).message || exception.message;
        errorType = (exRes as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorType = exception.name;
    }

    const errorObj: CustomApiError = {
      statusCode,
      message,
      error: errorType,
    };

    response
      .status(statusCode)
      .json(ApiResponseHelper.error(message, errorObj));
  }
}
