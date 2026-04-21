const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const MEDIA_BASE = API_BASE.replace("/api/v1", "");

/**
 * Resolves relative media URLs (from uploads) to absolute API URLs.
 * Pass-through for URLs that are already absolute.
 */
export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${MEDIA_BASE}${url}`;
}

type FetchOptions = RequestInit & { json?: unknown; _retry?: boolean };

async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { json, headers: customHeaders, _retry, ...rest } = options;

  const headers: Record<string, string> = {
    ...(customHeaders as Record<string, string>),
  };

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    credentials: "include", // Send httpOnly cookies
    body: json ? JSON.stringify(json) : rest.body,
  });

  // Auto-refresh token on 401 (once)
  if (res.status === 401 && !_retry && path !== "/auth/refresh") {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (refreshRes.ok) {
        const { accessToken } = await refreshRes.json();
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", accessToken);
        }
        // Retry original request with new token
        return apiFetch<T>(path, { ...options, _retry: true });
      }
    } catch {
      // refresh failed — fall through to throw
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = new Error(
      body.message || `API error ${res.status}`,
    ) as Error & {
      status: number;
      body: unknown;
    };
    error.status = res.status;
    error.body = body;
    throw error;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const api = {
  get: <T = unknown>(path: string) => apiFetch<T>(path, { method: "GET" }),

  post: <T = unknown>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: "POST", json: data }),

  patch: <T = unknown>(path: string, data?: unknown) =>
    apiFetch<T>(path, { method: "PATCH", json: data }),

  delete: <T = unknown>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),

  upload: <T = unknown>(path: string, formData: FormData) =>
    apiFetch<T>(path, { method: "POST", body: formData }),
};
