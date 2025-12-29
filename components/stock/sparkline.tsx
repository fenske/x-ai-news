"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";

interface SparklineProps {
  data: number[];
  className?: string;
  color?: string;
  showArea?: boolean;
}

export function Sparkline({
  data,
  className,
  color,
  showArea = true,
}: SparklineProps) {
  const { path, areaPath, isPositive } = useMemo(() => {
    if (data.length < 2) return { path: "", areaPath: "", isPositive: true };

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const width = 100;
    const height = 100;
    const padding = 5;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const area = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    const firstValue = data[0];
    const lastValue = data[data.length - 1];

    return {
      path: linePath,
      areaPath: area,
      isPositive: lastValue >= firstValue,
    };
  }, [data]);

  const strokeColor = color || (isPositive ? "#00d4aa" : "#ff4757");
  const fillColor = color
    ? `${color}33`
    : isPositive
    ? "rgba(0, 212, 170, 0.2)"
    : "rgba(255, 71, 87, 0.2)";

  if (data.length < 2) {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <span className="text-xs text-text-tertiary">No data</span>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
    >
      {showArea && (
        <path
          d={areaPath}
          fill={fillColor}
          className="transition-all duration-300"
        />
      )}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-all duration-300"
      />
    </svg>
  );
}
