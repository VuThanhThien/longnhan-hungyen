import { NextRequest, NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function GET(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const upstream = await forwardAdminApi(`/vouchers/${id}`);
  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });
  const contentType =
    upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await request.text();
  const upstream = await forwardAdminApi(`/vouchers/${id}`, {
    method: 'PATCH',
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

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const upstream = await forwardAdminApi(`/vouchers/${id}`, {
    method: 'DELETE',
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
