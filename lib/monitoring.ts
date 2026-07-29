/**
 * Monitoring and Alerts Library
 * Provides system health checks, metrics collection, and alerting functionality
 */

import type {
  Alert,
  AlertRule,
  AlertSeverity,
  AlertStatus,
  AlertCategory,
  SystemMetrics,
  HealthStatus,
  HealthCheck,
  AlertThresholds,
  MonitoringConfig,
} from "@/types/monitoring";

// Default thresholds for alerts
export const DEFAULT_THRESHOLDS: AlertThresholds = {
  errorRateThreshold: 5, // 5% error rate
  responseTimeThreshold: 2000, // 2000ms
  memoryThreshold: 85, // 85% memory usage
  cpuThreshold: 80, // 80% CPU usage
  databaseConnectionsThreshold: 80, // 80% of max connections
};

// Default monitoring configuration
export const DEFAULT_CONFIG: MonitoringConfig = {
  enabled: true,
  metricsRetentionDays: 30,
  alertHistoryDays: 90,
  healthCheckIntervalSeconds: 60,
  notificationSettings: {
    email: {
      enabled: false,
      fromAddress: "alerts@rayaramath.org",
      toAddresses: [],
    },
  },
};

/**
 * Generate a unique alert ID
 */
export function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new alert object
 */
export function createAlert(params: {
  title: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  source: string;
  metadata?: Record<string, unknown>;
}): Alert {
  const now = new Date();
  return {
    id: generateAlertId(),
    title: params.title,
    description: params.description,
    severity: params.severity,
    status: "active",
    category: params.category,
    source: params.source,
    createdAt: now,
    updatedAt: now,
    metadata: params.metadata,
  };
}

/**
 * Create an alert rule
 */
export function createAlertRule(params: {
  name: string;
  description: string;
  condition: string;
  severity: AlertSeverity;
  category: AlertCategory;
  cooldownMinutes?: number;
  notificationChannels?: string[];
}): AlertRule {
  const now = new Date();
  return {
    id: `rule_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name: params.name,
    description: params.description,
    condition: params.condition,
    severity: params.severity,
    category: params.category,
    enabled: true,
    cooldownMinutes: params.cooldownMinutes ?? 15,
    notificationChannels: (params.notificationChannels ?? ["email"]) as AlertRule["notificationChannels"],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Get severity color for UI
 */
export function getSeverityColor(severity: AlertSeverity): string {
  const colors: Record<AlertSeverity, string> = {
    critical: "text-red-600 bg-red-50 border-red-200",
    high: "text-orange-600 bg-orange-50 border-orange-200",
    medium: "text-amber-600 bg-amber-50 border-amber-200",
    low: "text-blue-600 bg-blue-50 border-blue-200",
    info: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return colors[severity];
}

/**
 * Get severity icon name
 */
export function getSeverityIcon(severity: AlertSeverity): string {
  const icons: Record<AlertSeverity, string> = {
    critical: "XCircle",
    high: "AlertTriangle",
    medium: "AlertCircle",
    low: "Info",
    info: "MessageCircle",
  };
  return icons[severity];
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: AlertStatus): string {
  const colors: Record<AlertStatus, string> = {
    active: "text-red-600 bg-red-50 border-red-200",
    acknowledged: "text-amber-600 bg-amber-50 border-amber-200",
    resolved: "text-green-600 bg-green-50 border-green-200",
    snoozed: "text-gray-600 bg-gray-50 border-gray-200",
  };
  return colors[status];
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: AlertCategory): string {
  const icons: Record<AlertCategory, string> = {
    system: "Server",
    security: "Shield",
    performance: "Gauge",
    data: "Database",
    user: "Users",
    business: "TrendingUp",
  };
  return icons[category];
}

/**
 * Calculate system metrics
 */
export async function collectSystemMetrics(): Promise<SystemMetrics> {
  const now = new Date();
  
  // In a real implementation, these would be collected from actual system APIs
  // For now, we return mock data structure
  return {
    timestamp: now,
    uptime: process.uptime(),
    memory: {
      used: 0,
      total: 0,
      percentage: 0,
    },
    cpu: {
      usage: 0,
      cores: 0,
    },
    requests: {
      total: 0,
      success: 0,
      errors: 0,
      averageResponseTime: 0,
    },
    database: {
      connections: 0,
      maxConnections: 100,
      queryTime: 0,
    },
    cache: {
      hits: 0,
      misses: 0,
      hitRate: 0,
    },
  };
}

/**
 * Perform a health check on a service
 */
export async function performHealthCheck(
  name: string,
  checkFn: () => Promise<{ healthy: boolean; latency?: number; message?: string }>
): Promise<HealthCheck> {
  const start = Date.now();
  const now = new Date();
  
  try {
    const result = await checkFn();
    return {
      name,
      status: result.healthy ? "healthy" : "unhealthy",
      latency: result.latency ?? Date.now() - start,
      message: result.message,
      checkedAt: now,
    };
  } catch (error) {
    return {
      name,
      status: "unhealthy",
      latency: Date.now() - start,
      message: error instanceof Error ? error.message : "Unknown error",
      checkedAt: now,
    };
  }
}

/**
 * Check overall health status from individual checks
 */
export function calculateOverallHealth(checks: HealthCheck[]): HealthStatus["overall"] {
  if (checks.length === 0) return "healthy";
  
  const unhealthyCount = checks.filter(c => c.status === "unhealthy").length;
  const degradedCount = checks.filter(c => c.status === "degraded").length;
  
  if (unhealthyCount > 0) return "unhealthy";
  if (degradedCount > 0) return "degraded";
  return "healthy";
}

/**
 * Check if metrics exceed thresholds and should trigger alerts
 */
export function checkThresholds(
  metrics: SystemMetrics,
  thresholds: AlertThresholds = DEFAULT_THRESHOLDS
): Alert[] {
  const alerts: Alert[] = [];
  
  // Check memory usage
  if (metrics.memory.percentage > thresholds.memoryThreshold) {
    alerts.push(
      createAlert({
        title: "High Memory Usage",
        description: `Memory usage is at ${metrics.memory.percentage.toFixed(1)}%, exceeding threshold of ${thresholds.memoryThreshold}%`,
        severity: metrics.memory.percentage > 95 ? "critical" : "high",
        category: "performance",
        source: "system",
        metadata: { memoryPercentage: metrics.memory.percentage },
      })
    );
  }
  
  // Check CPU usage
  if (metrics.cpu.usage > thresholds.cpuThreshold) {
    alerts.push(
      createAlert({
        title: "High CPU Usage",
        description: `CPU usage is at ${metrics.cpu.usage.toFixed(1)}%, exceeding threshold of ${thresholds.cpuThreshold}%`,
        severity: metrics.cpu.usage > 95 ? "critical" : "high",
        category: "performance",
        source: "system",
        metadata: { cpuPercentage: metrics.cpu.usage },
      })
    );
  }
  
  // Check error rate
  const errorRate = metrics.requests.total > 0 
    ? (metrics.requests.errors / metrics.requests.total) * 100 
    : 0;
  
  if (errorRate > thresholds.errorRateThreshold) {
    alerts.push(
      createAlert({
        title: "High Error Rate",
        description: `Error rate is at ${errorRate.toFixed(2)}%, exceeding threshold of ${thresholds.errorRateThreshold}%`,
        severity: errorRate > 20 ? "critical" : "high",
        category: "system",
        source: "system",
        metadata: { errorRate },
      })
    );
  }
  
  // Check response time
  if (metrics.requests.averageResponseTime > thresholds.responseTimeThreshold) {
    alerts.push(
      createAlert({
        title: "Slow Response Time",
        description: `Average response time is ${metrics.requests.averageResponseTime.toFixed(0)}ms, exceeding threshold of ${thresholds.responseTimeThreshold}ms`,
        severity: metrics.requests.averageResponseTime > 5000 ? "high" : "medium",
        category: "performance",
        source: "system",
        metadata: { responseTime: metrics.requests.averageResponseTime },
      })
    );
  }
  
  // Check database connections
  if (metrics.database.maxConnections > 0) {
    const dbUsage = (metrics.database.connections / metrics.database.maxConnections) * 100;
    if (dbUsage > thresholds.databaseConnectionsThreshold) {
      alerts.push(
        createAlert({
          title: "High Database Connection Usage",
          description: `Database connections at ${dbUsage.toFixed(1)}%, exceeding threshold of ${thresholds.databaseConnectionsThreshold}%`,
          severity: dbUsage > 95 ? "critical" : "high",
          category: "performance",
          source: "database",
          metadata: { connectionPercentage: dbUsage },
        })
      );
    }
  }
  
  return alerts;
}

/**
 * Format timestamp for display
 */
export function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

/**
 * Format bytes for display
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Filter alerts by status
 */
export function filterAlertsByStatus(alerts: Alert[], status: AlertStatus): Alert[] {
  return alerts.filter(a => a.status === status);
}

/**
 * Filter alerts by severity
 */
export function filterAlertsBySeverity(alerts: Alert[], severity: AlertSeverity): Alert[] {
  return alerts.filter(a => a.severity === severity);
}

/**
 * Sort alerts by priority (severity first, then date)
 */
export function sortAlertsByPriority(alerts: Alert[]): Alert[] {
  const severityOrder: Record<AlertSeverity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  
  return [...alerts].sort((a, b) => {
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(alert: Alert, acknowledgedBy: string): Alert {
  return {
    ...alert,
    status: "acknowledged",
    acknowledgedAt: new Date(),
    acknowledgedBy,
    updatedAt: new Date(),
  };
}

/**
 * Resolve an alert
 */
export function resolveAlert(alert: Alert, resolvedBy: string): Alert {
  return {
    ...alert,
    status: "resolved",
    resolvedAt: new Date(),
    resolvedBy,
    updatedAt: new Date(),
  };
}

/**
 * Snooze an alert
 */
export function snoozeAlert(alert: Alert, snoozeUntil: Date): Alert {
  return {
    ...alert,
    status: "snoozed",
    metadata: {
      ...alert.metadata,
      snoozeUntil: snoozeUntil.toISOString(),
    },
    updatedAt: new Date(),
  };
}
