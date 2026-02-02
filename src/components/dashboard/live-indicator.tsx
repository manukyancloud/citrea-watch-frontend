"use client";

import { cn } from "@/lib/utils";

interface LiveIndicatorProps {
  status?: "online" | "warning" | "offline";
  label?: string;
  className?: string;
}

export function LiveIndicator({
  status = "online",
  label = "Live",
  className,
}: LiveIndicatorProps) {
  const statusColors = {
    online: "bg-[#22c55e]",
    warning: "bg-[#f59e0b]",
    offline: "bg-[#ef4444]",
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("w-2 h-2 rounded-full live-pulse", statusColors[status])} />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}
