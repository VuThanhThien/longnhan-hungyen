import { isAxiosError } from 'axios';

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const payload = error.response?.data;
    if (payload && typeof payload === 'object') {
      const msg = (payload as { message?: string | string[] }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg)) return msg.join(', ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Request failed';
}
