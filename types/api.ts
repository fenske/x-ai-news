export interface APIResponse<T> {
  data: T;
  meta?: {
    cached: boolean;
    cachedAt?: string;
    rateLimit?: {
      remaining: number;
      resetAt: string;
    };
  };
}

export interface APIError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}
