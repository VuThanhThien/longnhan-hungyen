import { NextRequest, NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const upstream = await forwardAdminApi(
    `/vouchers?${url.searchParams.toString()}`,
  );
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });
  const contentType =
    upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const upstream = await forwardAdminApi('/vouchers', {
    method: 'POST',
    body,
  });
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });
  const contentType =
    upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
