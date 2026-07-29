"use client";

import { motion } from "framer-motion";
import { 
  XCircle, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  MessageCircle,
  CheckCircle,
  Clock,
  Bell
} from "lucide-react";
import type { Alert, AlertSeverity, AlertStatus } from "@/types/monitoring";
import { formatTimestamp, formatDuration } from "@/lib/monitoring";

interface AlertCardProps {
  alert: Alert;
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
  onSnooze?: (id: string) => void;
  compact?: boolean;
}

const severityConfig: Record<AlertSeverity, { 
  icon: typeof XCircle; 
  color: string; 
  bgColor: string;
  borderColor: string;
  label: string;
}> = {
  critical: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Critical",
  },
  high: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    label: "High",
  },
  medium: {
    icon: AlertCircle,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    label: "Medium",
  },
  low: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Low",
  },
  info: {
    icon: MessageCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: "Info",
  },
};

const statusConfig: Record<AlertStatus, {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
  label: string;
}> = {
  active: {
    icon: Bell,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Active",
  },
  acknowledged: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "Acknowledged",
  },
  resolved: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "Resolved",
  },
  snoozed: {
    icon: Clock,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    label: "Snoozed",
  },
};

export function AlertCard({ 
  alert, 
  onAcknowledge, 
  onResolve, 
  onSnooze,
  compact = false 
}: AlertCardProps) {
  const severity = severityConfig[alert.severity];
  const status = statusConfig[alert.status];
  const SeverityIcon = severity.icon;
  const StatusIcon = status.icon;
  
  const getUptimeText = () => {
    const now = new Date();
    const created = new Date(alert.createdAt);
    const diffSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
    return formatDuration(diffSeconds);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-2xl border ${alert.status === "active" ? severity.borderColor : "border-gray-200"}
        ${alert.status === "active" ? severity.bgColor : "bg-white"}
        p-4 shadow-sm transition-all duration-200
        hover:shadow-md
      `}
    >
      {/* Status indicator bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${severity.color.replace("text-", "bg-")}`} />
      
      <div className="pl-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <SeverityIcon className={`h-5 w-5 ${severity.color}`} />
            <span className={`text-xs font-semibold uppercase tracking-wide ${severity.color}`}>
              {severity.label}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${status.bgColor} ${status.color}`}>
              <StatusIcon className="h-3 w-3" />
              {status.label}
            </span>
          </div>
          <span className="text-xs text-stone-400 whitespace-nowrap">
            {getUptimeText()} ago
          </span>
        </div>
        
        {/* Title and Description */}
        <h3 className={`font-semibold text-stone-800 mb-1 ${compact ? "text-sm" : "text-base"}`}>
          {alert.title}
        </h3>
        {!compact && (
          <p className="text-sm text-stone-600 mb-3">
            {alert.description}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 border border-stone-200">
            {alert.category}
          </span>
          <span>Source: {alert.source}</span>
          <span>Created: {formatTimestamp(new Date(alert.createdAt))}</span>
        </div>
        
        {/* Actions */}
        {alert.status === "active" && (
          <div className="flex items-center gap-2 pt-2 border-t border-stone-200/50">
            {onAcknowledge && (
              <button
                onClick={() => onAcknowledge(alert.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-amber-600 border border-amber-200 hover:bg-amber-50 transition-colors"
              >
                <Clock className="h-3.5 w-3.5" />
                Acknowledge
              </button>
            )}
            {onResolve && (
              <button
                onClick={() => onResolve(alert.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-green-600 border border-green-200 hover:bg-green-50 transition-colors"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Resolve
              </button>
            )}
            {onSnooze && (
              <button
                onClick={() => onSnooze(alert.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Clock className="h-3.5 w-3.5" />
                Snooze
              </button>
            )}
          </div>
        )}
        
        {/* Acknowledged/Resolved info */}
        {alert.status === "acknowledged" && alert.acknowledgedBy && (
          <div className="mt-2 pt-2 border-t border-stone-200/50 text-xs text-stone-500">
            Acknowledged by {alert.acknowledgedBy} at {formatTimestamp(new Date(alert.acknowledgedAt!))}
          </div>
        )}
        {alert.status === "resolved" && alert.resolvedBy && (
          <div className="mt-2 pt-2 border-t border-stone-200/50 text-xs text-green-600">
            Resolved by {alert.resolvedBy} at {formatTimestamp(new Date(alert.resolvedAt!))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
