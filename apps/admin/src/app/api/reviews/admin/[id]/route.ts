import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.text();
  const upstream = await forwardAdminApi(`/reviews/admin/${id}`, {
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
