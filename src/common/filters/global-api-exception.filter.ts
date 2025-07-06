/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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

    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorType = 'InternalServerError';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exRes = exception.getResponse();
      if (typeof exRes === 'string') {
        errorMessage = exRes;
        errorType = exception.name;
      } else if (typeof exRes === 'object' && exRes !== null) {
        errorMessage = (exRes as any).message || exception.message;
        errorType = (exRes as any).error || exception.name;
      }
    } else if (exception instanceof Error) {
      errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      errorType = exception.name;
    }

    const errorObj: CustomApiError = {
      statusCode,
      message: exception instanceof Error ? exception.message : errorMessage,
      error: errorType,
    };

    response
      .status(statusCode)
      .json(ApiResponseHelper.error(errorMessage, errorObj));
  }
}
