import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function GET() {
  const upstream = await forwardAdminApi('/users/me');
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType =
    upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
