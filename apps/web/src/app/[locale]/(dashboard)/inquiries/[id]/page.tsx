'use client';

import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { api, resolveMediaUrl } from '@/lib/api';

interface InquiryDetail {
  id: string;
  type: string;
  status: string;
  message: string;
  moveInDate?: string;
  stayDuration?: number;
  occupants: number;
  hasPets: boolean;
  petDetails?: string;
  occupation?: string;
  aboutMe?: string;
  hostReply?: string;
  rejectionReason?: string;
  createdAt: string;
  tenantId: string;
  hostId: string;
  listing: {
    id: string;
    title: string;
    city: string;
    state: string;
    country: string;
    streetAddress: string | null;
    zipCode: string | null;
    pricePerMonth: number;
    currency: string;
    photos: { url: string; thumbnailUrl: string }[];
    host: {
      id: string;
      firstName: string;
      phone: string | null;
      whatsapp: string | null;
    };
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    email: string;
    phone: string | null;
    whatsapp: string | null;
  };
  host: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-100 text-blue-800',
};

export default function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = use(params);
  const t = useTranslations('inquiry');
  const router = useRouter();

  const [inquiry, setInquiry] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Get current user id from stored token payload
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.sub);
      }
    } catch {
      // ignore decode errors
    }

    api
      .get<{ data: InquiryDetail }>(`/inquiries/${id}`)
      .then((res) => setInquiry(res.data))
      .catch(() => router.push(`/${locale}/login`))
      .finally(() => setLoading(false));
  }, [id, locale, router]);

  async function handleAccept() {
    if (!inquiry) return;
    setActionLoading(true);
    try {
      await api.post(`/inquiries/${inquiry.id}/accept`);
      setInquiry((prev) => prev ? { ...prev, status: 'accepted' } : prev);
      setSuccessMsg(t('acceptSuccess'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('error', { ns: 'common' }));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!inquiry) return;
    setActionLoading(true);
    try {
      await api.post(`/inquiries/${inquiry.id}/reject`, { reason: rejectReason });
      setInquiry((prev) => prev ? { ...prev, status: 'rejected', rejectionReason: rejectReason } : prev);
      setShowRejectForm(false);
      setSuccessMsg(t('rejectSuccess'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('error', { ns: 'common' }));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReply() {
    if (!inquiry || !replyMessage.trim()) return;
    setActionLoading(true);
    try {
      await api.post(`/inquiries/${inquiry.id}/reply`, { message: replyMessage });
      setInquiry((prev) => prev ? { ...prev, hostReply: replyMessage } : prev);
      setShowReplyForm(false);
      setReplyMessage('');
      setSuccessMsg(t('replySuccess'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('error', { ns: 'common' }));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!inquiry || !confirm(t('cancelConfirm'))) return;
    setActionLoading(true);
    try {
      await api.post(`/inquiries/${inquiry.id}/cancel`);
      setInquiry((prev) => prev ? { ...prev, status: 'cancelled' } : prev);
      setSuccessMsg(t('cancelSuccess'));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('error', { ns: 'common' }));
    } finally {
      setActionLoading(false);
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

  if (!inquiry) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">Inquiry not found</p>
      </div>
    );
  }

  const isHost = currentUserId === inquiry.hostId;
  const isTenant = currentUserId === inquiry.tenantId;
  const isPending = inquiry.status === 'pending';
  const isAccepted = inquiry.status === 'accepted';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link
        href={`/${locale}/${isHost ? 'host/inquiries' : 'my-inquiries'}`}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        ← {isHost ? t('receivedTitle') : t('sentTitle')}
      </Link>

      {/* Success / Error banners */}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Header card */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">{t('detailTitle')}</h1>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {t('type.' + inquiry.type)} · {new Date(inquiry.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${statusColor[inquiry.status] || 'bg-gray-100 text-gray-700'}`}
            >
              {t(`status.${inquiry.status}`)}
            </span>
          </div>
        </div>

        {/* Listing */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
          <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
            {t('listing')}
          </h2>
          <div className="flex gap-4">
            <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-[hsl(var(--muted))]">
              {inquiry.listing.photos[0] ? (
                <img
                  src={resolveMediaUrl(inquiry.listing.photos[0].thumbnailUrl)}
                  alt={inquiry.listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🏠</div>
              )}
            </div>
            <div>
              <Link
                href={`/${locale}/listings/${inquiry.listing.id}`}
                className="font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]"
              >
                {inquiry.listing.title}
              </Link>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {inquiry.listing.city}, {inquiry.listing.state}, {inquiry.listing.country}
              </p>
              <p className="text-sm font-medium">
                {inquiry.listing.currency} {Number(inquiry.listing.pricePerMonth).toLocaleString()}/mo
              </p>
              {isAccepted && inquiry.listing.streetAddress && (
                <p className="mt-1 text-sm text-green-700">
                  📍 {inquiry.listing.streetAddress}, {inquiry.listing.zipCode}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tenant (visible to host) */}
        {isHost && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
            <h2 className="mb-3 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              {t('tenant')}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                {inquiry.tenant.avatarUrl ? (
                  <img src={resolveMediaUrl(inquiry.tenant.avatarUrl)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg">{inquiry.tenant.firstName[0]}</span>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {inquiry.tenant.firstName} {inquiry.tenant.lastName}
                </p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{inquiry.tenant.email}</p>
                {isAccepted && inquiry.tenant.phone && (
                  <p className="text-sm text-green-700">📞 {inquiry.tenant.phone}</p>
                )}
                {isAccepted && inquiry.tenant.whatsapp && (
                  <p className="text-sm text-green-700">💬 {inquiry.tenant.whatsapp}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inquiry message & details */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
          <div>
            <h2 className="mb-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              Message
            </h2>
            <p className="whitespace-pre-wrap text-[hsl(var(--foreground))]">{inquiry.message}</p>
          </div>

          {inquiry.aboutMe && (
            <div>
              <h3 className="mb-1 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {t('form.aboutMe')}
              </h3>
              <p className="text-sm text-[hsl(var(--foreground))]">{inquiry.aboutMe}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            {inquiry.moveInDate && (
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">{t('form.moveInDate')}: </span>
                {new Date(inquiry.moveInDate).toLocaleDateString()}
              </div>
            )}
            {inquiry.stayDuration && (
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">{t('form.stayDuration')}: </span>
                {inquiry.stayDuration} months
              </div>
            )}
            <div>
              <span className="text-[hsl(var(--muted-foreground))]">{t('form.occupants')}: </span>
              {inquiry.occupants}
            </div>
            {inquiry.occupation && (
              <div>
                <span className="text-[hsl(var(--muted-foreground))]">{t('form.occupation')}: </span>
                {inquiry.occupation}
              </div>
            )}
            {inquiry.hasPets && (
              <div className="col-span-2">
                🐾 {t('form.hasPets')}
                {inquiry.petDetails && ` — ${inquiry.petDetails}`}
              </div>
            )}
          </div>
        </div>

        {/* Host reply */}
        {inquiry.hostReply && (
          <div className="rounded-xl border border-[hsl(var(--border))] bg-blue-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
              {t('hostReply')}
            </h2>
            <p className="whitespace-pre-wrap text-[hsl(var(--foreground))]">{inquiry.hostReply}</p>
          </div>
        )}

        {inquiry.rejectionReason && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-red-600 uppercase tracking-wide">
              {t('form.reason')}
            </h2>
            <p className="text-[hsl(var(--foreground))]">{inquiry.rejectionReason}</p>
          </div>
        )}

        {/* Action area */}
        <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 space-y-4">
          {/* Host actions */}
          {isHost && isPending && (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAccept}
                disabled={actionLoading}
                className="rounded-lg bg-green-600 px-5 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {t('accept')}
              </button>
              <button
                onClick={() => setShowRejectForm(!showRejectForm)}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {t('reject')}
              </button>
            </div>
          )}

          {isHost && showRejectForm && isPending && (
            <div className="space-y-3">
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={t('form.reason')}
                rows={3}
                className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
              />
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? '...' : t('reject')}
              </button>
            </div>
          )}

          {/* Host reply form */}
          {isHost && !['rejected', 'cancelled', 'expired'].includes(inquiry.status) && (
            <div>
              {!showReplyForm ? (
                <button
                  onClick={() => setShowReplyForm(true)}
                  className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  {inquiry.hostReply ? 'Edit reply' : t('reply')}
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write your reply..."
                    rows={4}
                    className="w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReply}
                      disabled={actionLoading || !replyMessage.trim()}
                      className="rounded-lg bg-[hsl(var(--primary))] px-5 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] hover:opacity-90 disabled:opacity-50"
                    >
                      {actionLoading ? '...' : t('reply')}
                    </button>
                    <button
                      onClick={() => setShowReplyForm(false)}
                      className="rounded-lg border border-[hsl(var(--border))] px-5 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))]"
                    >
                      {t('cancel', { ns: 'common' })}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tenant cancel */}
          {isTenant && isPending && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="rounded-lg border border-red-300 px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {actionLoading ? '...' : t('cancel')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
