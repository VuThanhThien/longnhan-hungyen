'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_TOKEN_KEY } from '@/lib/auth-token';

const API_URL = process.env.API_URL || 'http://localhost:3001/api/v1';

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Vui lòng nhập email và mật khẩu' };
  }

  try {
    const res = await fetch(`${API_URL}/auth/email/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      return { error: 'Email hoặc mật khẩu không đúng' };
    }

    const json = await res.json();
    const data = json?.data ?? json;
    const accessToken = data?.accessToken;
    const refreshToken = data?.refreshToken;
    const tokenExpires = data?.tokenExpires;

    if (!accessToken || !refreshToken || typeof tokenExpires !== 'number') {
      return { error: 'Đăng nhập thất bại' };
    }

    const cookieStore = await cookies();
    cookieStore.set(AUTH_TOKEN_KEY, JSON.stringify({ accessToken, refreshToken, tokenExpires }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    cookieStore.delete('token');
  } catch {
    return { error: 'Lỗi kết nối máy chủ' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_TOKEN_KEY);
  cookieStore.delete('token');
  redirect('/login');
}
