"use client";

import { cn } from "@/lib/utils/cn";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, SentimentBadge } from "@/components/ui/badge";
import { formatRelativeTime, formatNumber } from "@/lib/utils/format";
import type { StockMention } from "@/types/sentiment";

interface PostFeedProps {
  posts: StockMention[];
  symbol?: string;
  loading?: boolean;
  className?: string;
}

export function PostFeed({ posts, symbol, loading, className }: PostFeedProps) {
  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className={cn("p-8 text-center", className)}>
        <p className="text-text-secondary">No posts found</p>
      </Card>
    );
  }

  // Generate X search URL for the stock symbol
  const searchUrl = symbol
    ? `https://x.com/search?q=%24${symbol}&src=typed_query&f=live`
    : null;

  return (
    <div className={cn("space-y-3", className)}>
      {searchUrl && (
        <div className="flex justify-end mb-2">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-text-amber hover:underline flex items-center gap-1"
          >
            Search ${symbol} on X
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

interface PostCardProps {
  post: StockMention;
}

function PostCard({ post }: PostCardProps) {
  return (
    <Card hover className="transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Author info */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-text-primary">
                {post.authorDisplayName}
              </span>
              <span className="text-text-tertiary text-sm">
                @{post.authorHandle}
              </span>
              {post.authorVerified && (
                <svg
                  className="w-4 h-4 text-info"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                </svg>
              )}
              <span className="text-text-tertiary text-xs">
                {formatNumber(post.authorFollowers)} followers
              </span>
              <span className="text-text-tertiary text-xs ml-auto">
                {formatRelativeTime(new Date(post.timestamp))}
              </span>
            </div>

            {/* Post content */}
            <p className="text-text-primary text-sm leading-relaxed mb-3">
              {post.content}
            </p>

            {/* Themes */}
            {post.themes.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {post.themes.map((theme) => (
                  <Badge key={theme} size="sm" variant="default">
                    {theme}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <HeartIcon className="w-3.5 h-3.5" />
                {formatNumber(post.engagement.likes)}
              </span>
              <span className="flex items-center gap-1">
                <RepeatIcon className="w-3.5 h-3.5" />
                {formatNumber(post.engagement.reposts)}
              </span>
              <span className="flex items-center gap-1">
                <CommentIcon className="w-3.5 h-3.5" />
                {formatNumber(post.engagement.replies)}
              </span>
              <span className="ml-auto text-text-tertiary italic text-[10px]">
                AI-summarized
              </span>
            </div>
          </div>

          {/* Sentiment badge */}
          <SentimentBadge sentiment={post.sentiment} />
        </div>
      </CardContent>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-4 w-24 bg-terminal-elevated rounded animate-pulse" />
        <div className="h-4 w-16 bg-terminal-elevated rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-terminal-elevated rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-terminal-elevated rounded animate-pulse" />
      </div>
      <div className="flex gap-4">
        <div className="h-4 w-12 bg-terminal-elevated rounded animate-pulse" />
        <div className="h-4 w-12 bg-terminal-elevated rounded animate-pulse" />
        <div className="h-4 w-12 bg-terminal-elevated rounded animate-pulse" />
      </div>
    </Card>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
