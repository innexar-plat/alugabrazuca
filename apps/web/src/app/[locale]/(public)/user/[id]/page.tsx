'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { api } from '@/lib/api';

interface PublicUser {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  currentCity?: string;
  currentCountry?: string;
  isVerified: boolean;
  createdAt: string;
  _count?: { listings: number };
}

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('profile');
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: PublicUser }>(`/users/${id}/public`)
      .then((res) => setUser(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-lg text-[hsl(var(--muted-foreground))]">User not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8">
        {/* Avatar + name */}
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-3xl font-bold text-[hsl(var(--muted-foreground))]">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              user.firstName[0]
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {user.firstName} {user.lastName[0]}.
            </h1>
            {(user.currentCity || user.currentCountry) && (
              <p className="text-[hsl(var(--muted-foreground))]">
                {[user.currentCity, user.currentCountry].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3 text-sm">
              {user.isVerified && (
                <span className="text-green-600">✓ {t('verified')}</span>
              )}
              <span className="text-[hsl(var(--muted-foreground))]">
                {t('joinedIn')} {new Date(user.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6">
            <p className="whitespace-pre-wrap text-[hsl(var(--foreground))]">{user.bio}</p>
          </div>
        )}

        {/* Stats */}
        {user._count && (
          <div className="mt-6 flex gap-6 border-t border-[hsl(var(--border))] pt-4 text-sm text-[hsl(var(--muted-foreground))]">
            <span>
              <strong className="text-[hsl(var(--foreground))]">{user._count.listings}</strong>{' '}
              {t('listings')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
