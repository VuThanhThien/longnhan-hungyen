import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '30';
  const folder = searchParams.get('folder');
  const query = new URLSearchParams({ page, limit });
  if (folder) query.set('folder', folder);

  const upstream = await forwardAdminApi(`/media?${query.toString()}`);
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
