import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.text();
  const upstream = await forwardAdminApi(`/products/${id}/variants`, {
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
