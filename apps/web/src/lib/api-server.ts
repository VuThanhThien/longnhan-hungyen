import 'server-only';

import { createLongnhanApi } from '@/lib/http/create-longnhan-api';

const baseURL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3001/api/v1';

export const apiServer = createLongnhanApi(baseURL);
