import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.json();

  const payload: { orderStatus?: string; paymentStatus?: string } = {};
  if (body?.orderStatus) payload.orderStatus = body.orderStatus;
  if (body?.paymentStatus) payload.paymentStatus = body.paymentStatus;

  if (!payload.orderStatus && !payload.paymentStatus) {
    return NextResponse.json({ message: 'Missing status payload' }, { status: 400 });
  }

  const upstream = await forwardAdminApi(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
