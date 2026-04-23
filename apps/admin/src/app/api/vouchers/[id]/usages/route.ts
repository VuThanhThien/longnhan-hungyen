import { NextRequest, NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(request.url);
  const upstream = await forwardAdminApi(
    `/vouchers/${id}/usages?${url.searchParams.toString()}`,
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
