"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import type { SentimentDirection } from "@/types/sentiment";

interface SentimentGaugeProps {
  score: number; // -100 to +100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  showChange?: boolean;
  change?: number;
  animated?: boolean;
  className?: string;
}

export function SentimentGauge({
  score,
  size = "md",
  showLabel = true,
  showChange = false,
  change,
  animated = true,
  className,
}: SentimentGaugeProps) {
  const direction: SentimentDirection = useMemo(() => {
    if (score > 20) return "bullish";
    if (score < -20) return "bearish";
    return "neutral";
  }, [score]);

  const normalizedScore = Math.max(-100, Math.min(100, score));

  const sizes = {
    sm: { outer: 100, stroke: 8, fontSize: "text-xl", labelSize: "text-xs" },
    md: { outer: 140, stroke: 10, fontSize: "text-3xl", labelSize: "text-sm" },
    lg: { outer: 180, stroke: 12, fontSize: "text-4xl", labelSize: "text-base" },
  };

  const { outer, stroke, fontSize, labelSize } = sizes[size];
  const radius = (outer - stroke) / 2;
  const centerX = outer / 2;
  const centerY = outer / 2;

  // Arc calculations for a 180-degree arc (bottom half)
  const startAngle = Math.PI; // 180 degrees (left)
  const endAngle = 0; // 0 degrees (right)

  // Calculate the arc path
  const startX = centerX + radius * Math.cos(startAngle);
  const startY = centerY + radius * Math.sin(startAngle);
  const endX = centerX + radius * Math.cos(endAngle);
  const endY = centerY + radius * Math.sin(endAngle);

  // Calculate fill percentage (0 = -100, 1 = +100)
  const fillPercentage = (normalizedScore + 100) / 200;

  // Calculate the angle for the filled portion
  const fillAngle = startAngle - (startAngle - endAngle) * fillPercentage;
  const fillX = centerX + radius * Math.cos(fillAngle);
  const fillY = centerY + radius * Math.sin(fillAngle);

  // Large arc flag: 0 for less than 180 degrees, 1 for more
  const largeArcFlag = fillPercentage > 0.5 ? 1 : 0;

  const colors = {
    bullish: { main: "#00d4aa", glow: "rgba(0, 212, 170, 0.4)" },
    bearish: { main: "#ff4757", glow: "rgba(255, 71, 87, 0.4)" },
    neutral: { main: "#6b7280", glow: "rgba(107, 114, 128, 0.4)" },
  };

  const color = colors[direction];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: outer, height: outer / 2 + 40 }}>
        <svg
          width={outer}
          height={outer / 2 + 20}
          viewBox={`0 0 ${outer} ${outer / 2 + 20}`}
          className="overflow-visible"
        >
          {/* Background arc */}
          <path
            d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`}
            fill="none"
            stroke="#2a2a3a"
            strokeWidth={stroke}
            strokeLinecap="round"
          />

          {/* Colored fill arc */}
          {fillPercentage > 0.01 && (
            <path
              d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${fillX} ${fillY}`}
              fill="none"
              stroke={color.main}
              strokeWidth={stroke}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${color.glow})`,
                transition: animated ? "d 0.5s ease-out" : "none",
              }}
            />
          )}

          {/* Scale labels */}
          <text
            x={stroke / 2 + 5}
            y={centerY + 15}
            fill="#606070"
            fontSize="11"
            fontFamily="var(--font-mono)"
          >
            -100
          </text>
          <text
            x={centerX}
            y={15}
            fill="#606070"
            fontSize="11"
            fontFamily="var(--font-mono)"
            textAnchor="middle"
          >
            0
          </text>
          <text
            x={outer - stroke / 2 - 5}
            y={centerY + 15}
            fill="#606070"
            fontSize="11"
            fontFamily="var(--font-mono)"
            textAnchor="end"
          >
            +100
          </text>
        </svg>

        {/* Score display - positioned below the arc */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ top: outer / 2 - 10 }}
        >
          <div
            className={cn(
              "font-mono font-bold tabular-nums",
              fontSize,
              direction === "bullish" && "text-bullish",
              direction === "bearish" && "text-bearish",
              direction === "neutral" && "text-neutral"
            )}
          >
            {score > 0 ? "+" : ""}
            {score}
          </div>
        </div>
      </div>

      {showLabel && (
        <div className="text-center -mt-2">
          <span
            className={cn(
              "font-semibold uppercase tracking-wider",
              labelSize,
              direction === "bullish" && "text-bullish",
              direction === "bearish" && "text-bearish",
              direction === "neutral" && "text-neutral"
            )}
          >
            {direction}
          </span>
          {showChange && change !== undefined && (
            <span
              className={cn(
                "ml-2 text-xs font-mono",
                change > 0 && "text-bullish",
                change < 0 && "text-bearish",
                change === 0 && "text-text-tertiary"
              )}
            >
              {change > 0 ? "+" : ""}
              {change} from yesterday
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact inline sentiment indicator
interface SentimentIndicatorProps {
  score: number;
  className?: string;
}

export function SentimentIndicator({ score, className }: SentimentIndicatorProps) {
  const direction: SentimentDirection =
    score > 20 ? "bullish" : score < -20 ? "bearish" : "neutral";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded font-mono text-sm",
        direction === "bullish" && "bg-bullish-muted text-bullish",
        direction === "bearish" && "bg-bearish-muted text-bearish",
        direction === "neutral" && "bg-neutral-muted text-neutral",
        className
      )}
    >
      <span className="font-semibold">
        {score > 0 ? "+" : ""}
        {score}
      </span>
    </div>
  );
}
