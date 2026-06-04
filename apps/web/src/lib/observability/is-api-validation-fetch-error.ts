import { isAxiosError } from 'axios';

/** Client/query validation (422) — not worth a Sentry exception after graceful fallbacks. */
export function isApiValidationFetchError(error: unknown): boolean {
  if (isAxiosError(error) && error.response?.status === 422) return true;
  if (error instanceof Error && error.message === 'Validation failed')
    return true;
  return false;
}
