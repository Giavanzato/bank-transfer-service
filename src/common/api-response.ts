/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
// src/common/api-response.ts
export interface CustomApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error: any | null;
}

export class ApiResponseHelper {
  static success<T>(data: T, message = 'OK'): CustomApiResponse<T> {
    return { success: true, message, data, error: null };
  }
  static error(message = 'Error', error: any = null): CustomApiResponse<null> {
    return { success: false, message, data: null, error };
  }
}
