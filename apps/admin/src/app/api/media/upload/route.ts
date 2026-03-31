import { NextResponse } from 'next/server';
import { forwardAdminApi } from '@/lib/admin-api-proxy';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const folder = searchParams.get('folder') || 'general';
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'Missing file' }, { status: 400 });
  }

  const payload = new FormData();
  payload.set('file', file);

  const upstream = await forwardAdminApi(`/media/upload?folder=${encodeURIComponent(folder)}`, {
    method: 'POST',
    body: payload,
  });

  const text = await upstream.text();
  if (!text) return new NextResponse(null, { status: upstream.status });

  const contentType = upstream.headers.get('content-type') || 'application/json';
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'content-type': contentType },
  });
}
