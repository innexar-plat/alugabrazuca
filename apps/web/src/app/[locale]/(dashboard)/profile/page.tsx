'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  nationality?: string;
  languages: string[];
  currentCity?: string;
  currentCountry?: string;
  preferredLang: string;
  avatarUrl?: string;
  isVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const t = useTranslations('profile');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });

  useEffect(() => {
    api
      .get<UserProfile>('/users/me')
      .then((user) => {
        setProfile(user);
        setForm({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone || '',
          whatsapp: user.whatsapp || '',
          bio: user.bio || '',
          nationality: user.nationality || '',
          languages: user.languages || [],
          currentCity: user.currentCity || '',
          currentCountry: user.currentCountry || '',
          preferredLang: user.preferredLang || 'pt',
        });
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api.patch<UserProfile>('/users/me', form);
      setProfile(updated);
      setSuccess(t('success'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    setSavingPw(true);
    setPwError('');
    setPwSuccess('');
    try {
      await api.patch('/users/me/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmPassword: pwForm.confirmNewPassword,
      });
      setPwSuccess(t('passwordSuccess'));
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (err: any) {
      setPwError(err.message || 'Error');
    } finally {
      setSavingPw(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]';

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))]">{t('title')}</h1>
      <p className="mb-8 text-[hsl(var(--muted-foreground))]">{t('subtitle')}</p>

      {/* Profile info card */}
      {profile && (
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-2xl font-bold text-[hsl(var(--muted-foreground))]">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              profile.firstName[0]
            )}
          </div>
          <div>
            <p className="font-semibold text-[hsl(var(--foreground))]">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{profile.email}</p>
            <div className="mt-1 flex items-center gap-2 text-xs">
              {profile.emailVerified ? (
                <span className="text-green-600">✓ {t('verified')}</span>
              ) : (
                <span className="text-amber-600">⚠ {t('notVerified')}</span>
              )}
              <span className="text-[hsl(var(--muted-foreground))]">
                {t('memberSince')} {new Date(profile.createdAt).getFullYear()}
              </span>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      {/* Edit form */}
      <div className="space-y-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('firstName')}</label>
            <input className={inputClass} value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('lastName')}</label>
            <input className={inputClass} value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('phone')}</label>
            <input className={inputClass} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+1..." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('whatsapp')}</label>
            <input className={inputClass} value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="+55..." />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">{t('bio')}</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
            placeholder={t('bioHint')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('nationality')}</label>
            <input className={inputClass} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('preferredLang')}</label>
            <select className={inputClass} value={form.preferredLang} onChange={(e) => set('preferredLang', e.target.value)}>
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('currentCity')}</label>
            <input className={inputClass} value={form.currentCity} onChange={(e) => set('currentCity', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">{t('currentCountry')}</label>
            <input className={inputClass} value={form.currentCountry} onChange={(e) => set('currentCountry', e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>

      {/* Change password */}
      <div className="mt-8 space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h2 className="text-lg font-semibold">{t('changePassword')}</h2>

        {pwSuccess && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {pwSuccess}
          </div>
        )}
        {pwError && (
          <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
            {pwError}
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium">{t('currentPassword')}</label>
          <input type="password" className={inputClass} value={pwForm.currentPassword} onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('newPassword')}</label>
          <input type="password" className={inputClass} value={pwForm.newPassword} onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">{t('confirmNewPassword')}</label>
          <input type="password" className={inputClass} value={pwForm.confirmNewPassword} onChange={(e) => setPwForm((p) => ({ ...p, confirmNewPassword: e.target.value }))} />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleChangePassword}
            disabled={savingPw || !pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmNewPassword}
            className="rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-50"
          >
            {savingPw ? t('saving') : t('changePassword')}
          </button>
        </div>
      </div>
    </div>
  );
}
