/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/common/filters/global-api-exception.filter.ts
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
      // Für "rohe" Fehler nimm als Hauptmessage lieber eine generische,
      // und packe die Originalmeldung ins error-Objekt!
      errorMessage = 'Ein unerwarteter Fehler ist aufgetreten.';
      errorType = exception.name;
    }

    // Im error-Objekt kannst du die Exception voll durchreichen
    const errorObj: CustomApiError = {
      statusCode,
      message: exception instanceof Error ? exception.message : errorMessage,
      error: errorType,
    };

    // Die *kurze* Message nach außen
    response
      .status(statusCode)
      .json(ApiResponseHelper.error(errorMessage, errorObj));
  }
}
