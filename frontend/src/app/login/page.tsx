'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL, persistAuthSession } from '@/lib/api';

export default function LoginPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email')?.toString().trim();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      setStatus('error');
      setMessage('ایمیل و رمز عبور الزامی است.');
      return;
    }

    try {
      const url = `${API_BASE_URL}/api/auth/login`;
      console.log('🔐 Attempting login to:', url);
      console.log('📧 Email:', email);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      console.log('📡 Login response status:', response.status, response.statusText);

      let payload;
      try {
        payload = await response.json();
        console.log('📋 Login payload:', payload);
      } catch (parseError) {
        console.error('❌ Failed to parse response:', parseError);
        const text = await response.text().catch(() => '');
        console.error('📦 Raw response:', text);
        throw new Error('پاسخ سرور نامعتبر است. لطفا دوباره تلاش کنید.');
      }

      if (!response.ok) {
        const errorMessage = payload?.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ Login failed:', errorMessage, payload);
        throw new Error(errorMessage);
      }

      if (!payload?.data?.token) {
        console.error('❌ No token in response:', payload);
        throw new Error('پاسخ سرور نامعتبر است. لطفا دوباره تلاش کنید.');
      }

      console.log('✅ Login successful, persisting session...');
      persistAuthSession(payload.data.token, payload.data.user);
      setStatus('success');
      setMessage('ورود موفق! در حال انتقال...');
      setTimeout(() => router.push('/account'), 800);
    } catch (err) {
      console.error('❌ Login error:', err);
      setStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'ورود با مشکل مواجه شد.';
      setMessage(errorMessage);
    }
  };

  return (
    <div className="bg-slate-50 px-4 py-10 md:px-8">
      <div className="mx-auto max-w-md rounded-[32px] border border-slate-100 bg-white p-8 shadow-lg">
        <p className="text-sm text-emerald-600">ورود به GameClub</p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">حساب خود را باز کنید</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm text-slate-600">
          <label className="block">
            ایمیل
            <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="you@email.com" />
          </label>
          <label className="block">
            رمز عبور
            <input name="password" type="password" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="••••••••" />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" className="accent-emerald-500" name="remember" />
            مرا به خاطر بسپار
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-emerald-500 py-3 text-sm font-bold text-white disabled:opacity-60"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'در حال ورود...' : 'ورود'}
          </button>
          {message && (
            <p className={`text-xs ${status === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>{message}</p>
          )}
          <p className="text-center text-xs text-slate-500">
            حساب ندارید؟ <Link href="/register" className="font-semibold text-emerald-600">ثبت نام</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
