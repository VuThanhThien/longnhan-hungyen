import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function POST() {
  const upstream = await forwardAdminApi('/auth/logout', { method: 'POST' });
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
