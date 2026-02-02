"use client";

import React from "react"

import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
  title?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export function GlassCard({
  children,
  className,
  tooltip,
  title,
  icon,
  headerAction,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl glass-card glass-card-hover transition-all duration-300",
        className
      )}
    >
      {(title || icon || tooltip || headerAction) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(239,143,54,0.1)]">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="text-[#EF8F36]">
                {icon}
              </div>
            )}
            {title && (
              <h3 className="text-sm font-medium text-[#EF8F36]">{title}</h3>
            )}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground hover:text-[#EF8F36] cursor-help transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground whitespace-pre-line text-left text-pretty"
                  >
                    <p>{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    period: string;
  };
  tooltip?: string;
  icon?: React.ReactNode;
  isLive?: boolean;
  className?: string;
  variant?: "default" | "hero";
}

export function MetricCard({
  title,
  value,
  change,
  tooltip,
  icon,
  isLive,
  className,
  variant = "default",
}: MetricCardProps) {
  const isPositive = change ? change.value >= 0 : true;

  return (
    <div
      className={cn(
        "rounded-xl glass-card glass-card-hover transition-all duration-300 p-5",
        variant === "hero" && "relative overflow-hidden",
        className
      )}
    >
      {variant === "hero" && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EF8F36] to-[#EB582A] rounded-full opacity-10 blur-2xl -translate-y-1/2 translate-x-1/2" />
      )}
      
      <div className="flex items-start justify-between relative">
        <div className="flex items-center gap-2">
          {icon && <div className="text-[#EF8F36]">{icon}</div>}
          <span className="text-xs text-[#EF8F36] uppercase tracking-wider font-medium">
            {title}
          </span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-[#EF8F36] cursor-help transition-colors" />
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs glass-card border-[rgba(239,143,54,0.2)] text-xs text-foreground whitespace-pre-line text-left text-pretty"
                >
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {isLive && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#22c55e] live-pulse" />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Live
            </span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p
          className={cn(
            "font-mono font-semibold tracking-tight",
            variant === "hero"
              ? "text-3xl lg:text-4xl gradient-text"
              : "text-2xl text-foreground"
          )}
        >
          {value}
        </p>
        {change && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                "text-sm font-mono font-medium",
                isPositive ? "text-[#22c55e]" : "text-[#ef4444]"
              )}
              style={{
                textShadow: isPositive
                  ? "0 0 10px rgba(34, 197, 94, 0.5)"
                  : "0 0 10px rgba(239, 68, 68, 0.5)",
              }}
            >
              {isPositive ? "+" : ""}
              {change.value}%
            </span>
            <span className="text-xs text-muted-foreground">{change.period}</span>
          </div>
        )}
      </div>
    </div>
  );
}

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
}

export function Sparkline({ data, color = "#EF8F36", height = 24 }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((value - min) / range) * height;
      return `${x},${height - y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      className="w-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} 100,${height}`}
        fill={`url(#sparkline-gradient-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        style={{
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
}
