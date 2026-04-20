'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('listing.create');
  const f = useTranslations('listing.create.fields');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    api
      .get<{ data: any }>(`/listings/${id}`)
      .then((res) => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/my-listings');
      });
  }, [id, router]);

  function set(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function inputProps(field: string, type: string = 'text') {
    return {
      id: field,
      type,
      value: form[field] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const val = type === 'number' ? Number(e.target.value) : e.target.value;
        set(field, val);
      },
      className:
        'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]',
    };
  }

  function checkboxProps(field: string) {
    return {
      id: field,
      type: 'checkbox' as const,
      checked: !!form[field],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(field, e.target.checked),
      className: 'h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))]',
    };
  }

  function selectProps(field: string) {
    return {
      id: field,
      value: form[field] ?? '',
      onChange: (e: React.ChangeEvent<HTMLSelectElement>) => set(field, e.target.value),
      className:
        'w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]',
    };
  }

  function Label({ field }: { field: string }) {
    return (
      <label htmlFor={field} className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]">
        {f(field as any)}
      </label>
    );
  }

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/listings/${id}`, form);
      router.push('/my-listings');
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-[hsl(var(--foreground))]">
        {t('title')} — {form.title}
      </h1>

      {error && (
        <div className="mb-4 rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
          {error}
        </div>
      )}

      <div className="space-y-6 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div>
          <Label field="title" />
          <input {...inputProps('title')} required minLength={10} maxLength={120} />
        </div>
        <div>
          <Label field="description" />
          <textarea
            id="description"
            rows={4}
            value={form.description ?? ''}
            onChange={(e) => set('description', e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary))] focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label field="country" />
            <input {...inputProps('country')} />
          </div>
          <div>
            <Label field="state" />
            <input {...inputProps('state')} />
          </div>
          <div>
            <Label field="city" />
            <input {...inputProps('city')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label field="pricePerMonth" />
            <input {...inputProps('pricePerMonth', 'number')} min={1} />
          </div>
          <div>
            <Label field="availableFrom" />
            <input {...inputProps('availableFrom', 'date')} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center gap-2">
            <input {...checkboxProps('utilitiesIncluded')} />
            <span className="text-sm">{f('utilitiesIncluded')}</span>
          </label>
          <label className="flex items-center gap-2">
            <input {...checkboxProps('internetIncluded')} />
            <span className="text-sm">{f('internetIncluded')}</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          onClick={() => router.push('/my-listings')}
          className="rounded-lg border border-[hsl(var(--border))] px-6 py-2 text-sm"
        >
          {t('previous')}
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-[hsl(var(--primary))] px-6 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] disabled:opacity-50"
        >
          {saving ? '...' : t('saveDraft')}
        </button>
      </div>
    </div>
  );
}
