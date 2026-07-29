// Monitoring and Alerts Type Definitions

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";
export type AlertStatus = "active" | "acknowledged" | "resolved" | "snoozed";
export type AlertCategory = "system" | "security" | "performance" | "data" | "user" | "business";
export type NotificationChannel = "email" | "sms" | "push" | "slack" | "webhook";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  source: string;
  createdAt: Date;
  updatedAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: string;
  severity: AlertSeverity;
  category: AlertCategory;
  enabled: boolean;
  cooldownMinutes: number;
  notificationChannels: NotificationChannel[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AlertNotification {
  id: string;
  alertId: string;
  channel: NotificationChannel;
  recipient: string;
  sentAt: Date;
  delivered: boolean;
  error?: string;
}

export interface SystemMetrics {
  timestamp: Date;
  uptime: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  requests: {
    total: number;
    success: number;
    errors: number;
    averageResponseTime: number;
  };
  database: {
    connections: number;
    maxConnections: number;
    queryTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}

export interface HealthCheck {
  name: string;
  status: "healthy" | "degraded" | "unhealthy";
  latency?: number;
  message?: string;
  checkedAt: Date;
}

export interface HealthStatus {
  overall: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  checkedAt: Date;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsRetentionDays: number;
  alertHistoryDays: number;
  healthCheckIntervalSeconds: number;
  notificationSettings: NotificationSettings;
}

export interface NotificationSettings {
  email: EmailNotificationConfig;
  slack?: SlackNotificationConfig;
  webhook?: WebhookNotificationConfig;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromAddress: string;
  toAddresses: string[];
}

export interface SlackNotificationConfig {
  enabled: boolean;
  webhookUrl?: string;
  channel?: string;
  mentionOnCritical: boolean;
}

export interface WebhookNotificationConfig {
  enabled: boolean;
  url?: string;
  secret?: string;
  retryAttempts: number;
}

export interface AlertThresholds {
  errorRateThreshold: number;
  responseTimeThreshold: number;
  memoryThreshold: number;
  cpuThreshold: number;
  databaseConnectionsThreshold: number;
}
