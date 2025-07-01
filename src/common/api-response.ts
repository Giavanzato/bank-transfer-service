// src/common/api-response.ts
export interface CustomApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error?: CustomApiError | null;
}

export interface CustomApiError {
  statusCode: number;
  message: string;
  error: string;
  // Du könntest hier noch errorCode?: string; usw. ergänzen
}

export class ApiResponseHelper {
  static success<T>(data: T, message = 'OK'): CustomApiResponse<T> {
    return { success: true, message, data, error: null };
  }
  static error(
    message = 'Error',
    error: CustomApiError | null = null,
  ): CustomApiResponse<null> {
    return { success: false, message, data: null, error };
  }
}
