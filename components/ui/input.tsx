"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, error, clearable, onClear, type, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            "w-full h-10 px-4 bg-terminal-elevated border border-terminal-border rounded-lg",
            "text-sm text-text-primary placeholder:text-text-tertiary",
            "transition-colors duration-200",
            "focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon && "pl-10",
            clearable && props.value && "pr-10",
            error && "border-bearish/50 focus:border-bearish focus:ring-bearish/20",
            className
          )}
          {...props}
        />
        {clearable && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        {error && (
          <p className="mt-1 text-xs text-bearish">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
