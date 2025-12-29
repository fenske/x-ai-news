"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import type { SentimentDirection } from "@/types/sentiment";
import type { AlertSeverity } from "@/types/alert";

type BadgeVariant =
  | "default"
  | "bullish"
  | "bearish"
  | "neutral"
  | "critical"
  | "warning"
  | "info";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variants: Record<BadgeVariant, string> = {
      default:
        "bg-terminal-elevated text-text-secondary border-terminal-border",
      bullish: "bg-bullish-muted text-bullish border-bullish/30",
      bearish: "bg-bearish-muted text-bearish border-bearish/30",
      neutral: "bg-neutral-muted text-neutral border-neutral/30",
      critical: "bg-critical/10 text-critical border-critical/30",
      warning: "bg-warning/10 text-warning border-warning/30",
      info: "bg-info/10 text-info border-info/30",
    };

    const sizes = {
      sm: "px-1.5 py-0.5 text-[10px]",
      md: "px-2 py-1 text-xs",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-mono font-medium border rounded",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

// Helper component for sentiment badges
interface SentimentBadgeProps extends Omit<BadgeProps, "variant"> {
  sentiment: SentimentDirection;
  score?: number;
}

function SentimentBadge({
  sentiment,
  score,
  className,
  ...props
}: SentimentBadgeProps) {
  const variant: BadgeVariant = sentiment;
  const label =
    score !== undefined
      ? `${score > 0 ? "+" : ""}${score}`
      : sentiment.charAt(0).toUpperCase() + sentiment.slice(1);

  return (
    <Badge variant={variant} className={className} {...props}>
      {label}
    </Badge>
  );
}

// Helper component for severity badges
interface SeverityBadgeProps extends Omit<BadgeProps, "variant"> {
  severity: AlertSeverity;
}

function SeverityBadge({ severity, className, ...props }: SeverityBadgeProps) {
  const variant: BadgeVariant = severity;
  const labels: Record<AlertSeverity, string> = {
    critical: "Critical",
    warning: "Warning",
    info: "Info",
  };

  return (
    <Badge variant={variant} className={className} {...props}>
      {labels[severity]}
    </Badge>
  );
}

export { Badge, SentimentBadge, SeverityBadge };
