'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/components/providers/auth-provider';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post<{ accessToken: string }>('/auth/login', {
        email,
        password,
      });
      await login(res.accessToken);
      const returnUrl = searchParams.get('returnUrl') || '/';
      router.push(returnUrl);
    } catch (err: unknown) {
      const apiErr = err as { status?: number };
      if (apiErr.status === 401) setError(t('invalidCredentials'));
      else if (apiErr.status === 403) setError(t('emailNotVerified'));
      else if (apiErr.status === 429) setError(t('tooManyAttempts'));
      else setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {t('subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {t('email')}
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
          >
            {t('password')}
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] outline-none ring-[hsl(var(--ring))] focus:ring-2"
          />
        </div>

        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-sm text-[hsl(var(--primary))] hover:underline"
          >
            {t('forgotPassword')}
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '...' : t('submit')}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
        {t('noAccount')}{' '}
        <Link
          href="/register"
          className="font-medium text-[hsl(var(--primary))] hover:underline"
        >
          {t('createAccount')}
        </Link>
      </div>
    </div>
  );
}
