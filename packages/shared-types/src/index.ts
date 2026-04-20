// Shared types between frontend and backend
// Types are added as modules are implemented.

export type Locale = "pt" | "en" | "es";

export type AppEnvironment = "development" | "staging" | "production";

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface PaginationQuery {
  page?: number;
  perPage?: number;
}
