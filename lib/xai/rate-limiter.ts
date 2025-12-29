export class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 60, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();

    // Remove expired timestamps
    this.requests = this.requests.filter((t) => t > now - this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.requests[0] + this.windowMs - now;
      await new Promise((r) => setTimeout(r, waitTime));
      return this.acquire();
    }

    this.requests.push(now);
  }

  canProceed(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter((t) => t > now - this.windowMs);
    return this.requests.length < this.maxRequests;
  }

  remaining(): number {
    const now = Date.now();
    this.requests = this.requests.filter((t) => t > now - this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  resetTime(): Date {
    if (this.requests.length === 0) {
      return new Date();
    }
    return new Date(this.requests[0] + this.windowMs);
  }
}

// Global rate limiter for xAI API
export const apiRateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
