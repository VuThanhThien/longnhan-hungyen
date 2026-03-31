import axios, { type AxiosInstance, isAxiosError } from 'axios';

function extractMessage(error: unknown): string {
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

export function createLongnhanApi(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  instance.interceptors.response.use(
    (response) => {
      const body = response.data;
      const isPaginatedEnvelope =
        body !== null &&
        typeof body === 'object' &&
        'data' in body &&
        'pagination' in body;

      if (
        !isPaginatedEnvelope &&
        body !== null &&
        typeof body === 'object' &&
        'data' in body
      ) {
        response.data = (body as { data: unknown }).data;
      }
      return response;
    },
    (error) => Promise.reject(new Error(extractMessage(error))),
  );

  return instance;
}
