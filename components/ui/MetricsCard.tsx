"use client";

import { motion } from "framer-motion";
import { 
  Server, 
  Cpu, 
  HardDrive, 
  Database,
  Zap,
  Activity,
  Clock
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "amber" | "blue" | "green" | "red" | "purple";
  loading?: boolean;
}

const colorConfig = {
  amber: {
    iconBg: "bg-gradient-to-br from-amber-100 to-orange-100",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
  blue: {
    iconBg: "bg-gradient-to-br from-blue-100 to-indigo-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  green: {
    iconBg: "bg-gradient-to-br from-green-100 to-emerald-100",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  red: {
    iconBg: "bg-gradient-to-br from-red-100 to-pink-100",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  purple: {
    iconBg: "bg-gradient-to-br from-purple-100 to-violet-100",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
};

export function MetricsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "amber",
  loading = false,
}: MetricsCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={`
        relative overflow-hidden rounded-2xl border ${config.borderColor}
        bg-white p-5 shadow-sm transition-all duration-200
        hover:shadow-lg
      `}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.iconBg} shadow-sm`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <p className="text-sm font-medium text-stone-500">{title}</p>
        </div>
        
        {loading ? (
          <div className="h-9 w-24 rounded-xl skeleton-temple" />
        ) : (
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-stone-900 tracking-tight">{value}</p>
            {trend && (
              <span className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
        )}
        
        {subtitle && (
          <p className="mt-1 text-xs text-stone-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

interface HealthStatusCardProps {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  message?: string;
}

const healthConfig = {
  healthy: {
    icon: Zap,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    label: "Healthy",
  },
  degraded: {
    icon: Activity,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
    label: "Degraded",
  },
  unhealthy: {
    icon: Server,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    label: "Unhealthy",
  },
};

export function HealthStatusCard({ name, status, latency, message }: HealthStatusCardProps) {
  const config = healthConfig[status];
  const StatusIcon = config.icon;

  return (
    <div className={`
      flex items-center justify-between rounded-xl border ${config.borderColor}
      ${config.bgColor}/30 p-4 transition-all duration-200
    `}>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.bgColor}`}>
          <StatusIcon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div>
          <p className="font-medium text-stone-800">{name}</p>
          {message && (
            <p className="text-xs text-stone-500">{message}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {latency !== undefined && (
          <span className="flex items-center gap-1 text-xs text-stone-500">
            <Clock className="h-3.5 w-3.5" />
            {latency}ms
          </span>
        )}
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${config.bgColor} ${config.color}`}>
          {config.label}
        </span>
      </div>
    </div>
  );
}

interface SystemMetricsDisplayProps {
  uptime: number;
  memoryUsed: number;
  memoryTotal: number;
  cpuUsage: number;
  cpuCores: number;
}

export function SystemMetricsDisplay({
  uptime,
  memoryUsed,
  memoryTotal,
  cpuUsage,
  cpuCores,
}: SystemMetricsDisplayProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const memoryPercentage = memoryTotal > 0 ? (memoryUsed / memoryTotal) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="System Uptime"
        value={formatUptime(uptime)}
        icon={Clock}
        color="green"
      />
      <MetricsCard
        title="Memory Usage"
        value={`${memoryPercentage.toFixed(0)}%`}
        subtitle={`${(memoryUsed / 1024 / 1024 / 1024).toFixed(1)} GB / ${(memoryTotal / 1024 / 1024 / 1024).toFixed(1)} GB`}
        icon={HardDrive}
        color={memoryPercentage > 85 ? "red" : memoryPercentage > 70 ? "amber" : "blue"}
      />
      <MetricsCard
        title="CPU Usage"
        value={`${cpuUsage.toFixed(0)}%`}
        subtitle={`${cpuCores} cores`}
        icon={Cpu}
        color={cpuUsage > 80 ? "red" : cpuUsage > 60 ? "amber" : "blue"}
      />
      <MetricsCard
        title="Requests"
        value="--"
        subtitle="Real-time tracking"
        icon={Activity}
        color="purple"
      />
    </div>
  );
}

interface DatabaseMetricsProps {
  connections: number;
  maxConnections: number;
  queryTime: number;
}

export function DatabaseMetrics({ connections, maxConnections, queryTime }: DatabaseMetricsProps) {
  const usagePercentage = maxConnections > 0 ? (connections / maxConnections) * 100 : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricsCard
        title="DB Connections"
        value={`${connections}/${maxConnections}`}
        subtitle={`${usagePercentage.toFixed(0)}% used`}
        icon={Database}
        color={usagePercentage > 80 ? "red" : usagePercentage > 60 ? "amber" : "green"}
      />
      <MetricsCard
        title="Avg Query Time"
        value={`${queryTime.toFixed(0)}ms`}
        icon={Zap}
        color={queryTime > 100 ? "red" : queryTime > 50 ? "amber" : "green"}
      />
      <MetricsCard
        title="Cache Hit Rate"
        value="--"
        subtitle="Redis metrics"
        icon={HardDrive}
        color="blue"
      />
    </div>
  );
}
