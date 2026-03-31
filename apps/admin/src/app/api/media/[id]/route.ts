import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const upstream = await forwardAdminApi(`/media/${id}`, { method: 'DELETE' });
  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
