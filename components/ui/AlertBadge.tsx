"use client";

import { 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  MessageCircle 
} from "lucide-react";
import type { AlertSeverity } from "@/types/monitoring";

interface AlertBadgeProps {
  severity: AlertSeverity;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const severityConfig: Record<AlertSeverity, {
  icon: typeof XCircle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    label: "Low",
  },
  info: {
    icon: MessageCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    label: "Info",
  },
};

const sizeConfig = {
  sm: "text-xs px-1.5 py-0.5 gap-1",
  md: "text-xs px-2 py-1 gap-1.5",
  lg: "text-sm px-2.5 py-1 gap-1.5",
};

const iconSizeConfig = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

export function AlertBadge({ severity, showIcon = true, size = "md" }: AlertBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.color}
        ${sizeConfig[size]}
      `}
    >
      {showIcon && <Icon className={iconSizeConfig[size]} />}
      {config.label}
    </span>
  );
}

interface AlertCountBadgeProps {
  count: number;
  severity?: AlertSeverity;
  maxCount?: number;
}

export function AlertCountBadge({ count, severity = "critical", maxCount = 99 }: AlertCountBadgeProps) {
  if (count === 0) return null;
  
  const config = severityConfig[severity];
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={`
        inline-flex h-5 min-w-5 items-center justify-center rounded-full
        text-xs font-bold text-white
        ${config.bgColor.replace("100", "500")}
      `}
    >
      {displayCount}
    </span>
  );
}

interface StatusDotProps {
  status: "healthy" | "degraded" | "unhealthy" | "active" | "inactive";
  pulse?: boolean;
}

const statusColors = {
  healthy: "bg-green-500",
  degraded: "bg-amber-500",
  unhealthy: "bg-red-500",
  active: "bg-blue-500",
  inactive: "bg-gray-400",
};

export function StatusDot({ status, pulse = false }: StatusDotProps) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {pulse && (
        <span
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${statusColors[status]} animate-ping`}
        />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${statusColors[status]}`} />
    </span>
  );
}
