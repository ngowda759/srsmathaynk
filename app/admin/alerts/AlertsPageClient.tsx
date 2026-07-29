"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Activity, 
  Settings, 
  RefreshCw,
  Filter,
  Search,
  Server,
  Database,
  Zap,
  Globe,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { AlertCard, MetricsCard, HealthStatusCard } from "@/components/ui";
import type { Alert, AlertSeverity, AlertStatus, HealthStatus, SystemMetrics } from "@/types/monitoring";
import { 
  collectSystemMetrics, 
  performHealthCheck,
  calculateOverallHealth,
  sortAlertsByPriority
} from "@/lib/monitoring";
import { useAuth } from "@/hooks/useAuth";

// Mock data for demonstration
const generateMockAlerts = (): Alert[] => {
  const now = new Date();
  return [
    {
      id: "alert_1",
      title: "High Memory Usage Detected",
      description: "Memory usage has exceeded 85% threshold. Current usage at 87.3%. Consider scaling or optimizing memory-intensive operations.",
      severity: "high" as AlertSeverity,
      status: "active" as AlertStatus,
      category: "performance",
      source: "system",
      createdAt: new Date(now.getTime() - 15 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 15 * 60 * 1000),
    },
    {
      id: "alert_2",
      title: "Database Connection Pool Low",
      description: "Database connection usage is at 78%. Approaching threshold of 80%.",
      severity: "medium" as AlertSeverity,
      status: "acknowledged" as AlertStatus,
      category: "performance",
      source: "database",
      createdAt: new Date(now.getTime() - 45 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 30 * 60 * 1000),
      acknowledgedAt: new Date(now.getTime() - 30 * 60 * 1000),
      acknowledgedBy: "admin@rayaramath.org",
    },
    {
      id: "alert_3",
      title: "Failed Login Attempts",
      description: "3 failed login attempts detected from IP 192.168.1.xxx in the last 10 minutes. No action required if user forgot password.",
      severity: "low" as AlertSeverity,
      status: "resolved" as AlertStatus,
      category: "security",
      source: "auth",
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      acknowledgedAt: new Date(now.getTime() - 1.8 * 60 * 60 * 1000),
      acknowledgedBy: "admin@rayaramath.org",
      resolvedAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      resolvedBy: "admin@rayaramath.org",
    },
    {
      id: "alert_4",
      title: "API Response Time Elevated",
      description: "Average API response time has increased to 1200ms from baseline of 200ms. Investigating potential causes.",
      severity: "medium" as AlertSeverity,
      status: "active" as AlertStatus,
      category: "performance",
      source: "api",
      createdAt: new Date(now.getTime() - 5 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
      id: "alert_5",
      title: "Backup Completed Successfully",
      description: "Daily database backup completed successfully. Backup size: 2.3 GB, Duration: 15 minutes.",
      severity: "info" as AlertSeverity,
      status: "active" as AlertStatus,
      category: "system",
      source: "backup",
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    },
  ];
};

const filterOptions: { value: AlertStatus | "all"; label: string; icon: typeof Bell }[] = [
  { value: "all", label: "All Alerts", icon: Bell },
  { value: "active", label: "Active", icon: AlertCircle },
  { value: "acknowledged", label: "Acknowledged", icon: Clock },
  { value: "resolved", label: "Resolved", icon: CheckCircle },
];

const severityFilters: { value: AlertSeverity | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" },
];

export default function AlertsPageClient() {
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>(generateMockAlerts());
  const [statusFilter, setStatusFilter] = useState<AlertStatus | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"alerts" | "health" | "metrics">("alerts");
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate health checks
  useEffect(() => {
    const performHealthChecks = async () => {
      const checks = [
        await performHealthCheck("API Server", async () => ({
          healthy: true,
          latency: Math.floor(Math.random() * 100) + 50,
        })),
        await performHealthCheck("Database", async () => ({
          healthy: true,
          latency: Math.floor(Math.random() * 50) + 10,
        })),
        await performHealthCheck("Cache (Redis)", async () => ({
          healthy: Math.random() > 0.1,
          latency: Math.floor(Math.random() * 20) + 5,
          message: Math.random() > 0.1 ? undefined : "Connection timeout",
        })),
        await performHealthCheck("External Services", async () => ({
          healthy: true,
          latency: Math.floor(Math.random() * 200) + 100,
        })),
        await performHealthCheck("File Storage", async () => ({
          healthy: true,
          latency: Math.floor(Math.random() * 30) + 20,
        })),
      ];

      setHealthStatus({
        overall: calculateOverallHealth(checks),
        checks,
        checkedAt: new Date(),
      });
    };

    const interval = setInterval(performHealthChecks, 30000);
    performHealthChecks();
    
    return () => clearInterval(interval);
  }, []);

  // Simulate metrics collection
  useEffect(() => {
    const collectMetrics = async () => {
      const mockMetrics = await collectSystemMetrics();
      mockMetrics.uptime = 86400 * 3 + Math.floor(Math.random() * 86400);
      mockMetrics.memory = {
        used: Math.floor(Math.random() * 2 + 2) * 1024 * 1024 * 1024,
        total: 4 * 1024 * 1024 * 1024,
        percentage: Math.floor(Math.random() * 30 + 55),
      };
      mockMetrics.cpu = {
        usage: Math.floor(Math.random() * 40 + 20),
        cores: 4,
      };
      mockMetrics.requests = {
        total: 15420,
        success: 15150,
        errors: 270,
        averageResponseTime: 180,
      };
      mockMetrics.database = {
        connections: 45,
        maxConnections: 100,
        queryTime: 25,
      };
      mockMetrics.cache = {
        hits: 125000,
        misses: 5000,
        hitRate: 96,
      };
      
      setMetrics(mockMetrics);
      setLoading(false);
    };

    const interval = setInterval(collectMetrics, 10000);
    collectMetrics();
    
    return () => clearInterval(interval);
  }, []);

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    if (statusFilter !== "all" && alert.status !== statusFilter) return false;
    if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.source.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sortedAlerts = sortAlertsByPriority(filteredAlerts);

  // Stats
  const activeAlerts = alerts.filter(a => a.status === "active").length;
  const criticalAlerts = alerts.filter(a => a.status === "active" && a.severity === "critical").length;

  // Handlers
  const handleAcknowledge = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, status: "acknowledged" as AlertStatus, acknowledgedAt: new Date(), acknowledgedBy: profile?.email || "admin" }
        : alert
    ));
  };

  const handleResolve = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, status: "resolved" as AlertStatus, resolvedAt: new Date(), resolvedBy: profile?.email || "admin" }
        : alert
    ));
  };

  const handleSnooze = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id 
        ? { ...alert, status: "snoozed" as AlertStatus }
        : alert
    ));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const tabs = [
    { id: "alerts" as const, label: "Alerts", icon: Bell, count: activeAlerts },
    { id: "health" as const, label: "Health", icon: Activity, count: null },
    { id: "metrics" as const, label: "Metrics", icon: Zap, count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-r from-white via-amber-50/30 to-orange-50/20 p-6 shadow-lg"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 shadow-lg">
              <Bell className="h-7 w-7 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Alerts & Monitoring</h1>
              <p className="text-sm text-stone-500 mt-1">
                System health, alerts, and performance metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {criticalAlerts > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-red-100 px-4 py-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm font-semibold text-red-600">{criticalAlerts} Critical</span>
              </div>
            )}
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-lg hover:shadow-xl transition-shadow">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? "text-amber-600" 
                  : "text-stone-500 hover:text-stone-700"}
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className={`
                  inline-flex h-5 min-w-5 items-center justify-center rounded-full text-xs font-bold
                  ${activeTab === tab.id ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-600"}
                `}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "alerts" && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200 p-1">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`
                      inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all
                      ${statusFilter === option.value
                        ? "bg-amber-100 text-amber-700"
                        : "text-stone-500 hover:bg-stone-50"}
                    `}
                  >
                    <option.icon className="h-4 w-4" />
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-stone-400" />
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | "all")}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                >
                  {severityFilters.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <MetricsCard
                title="Active Alerts"
                value={activeAlerts}
                icon={AlertCircle}
                color={activeAlerts > 5 ? "red" : activeAlerts > 0 ? "amber" : "green"}
                loading={loading}
              />
              <MetricsCard
                title="Acknowledged"
                value={alerts.filter(a => a.status === "acknowledged").length}
                icon={Clock}
                color="amber"
                loading={loading}
              />
              <MetricsCard
                title="Resolved Today"
                value={alerts.filter(a => a.status === "resolved").length}
                icon={CheckCircle}
                color="green"
                loading={loading}
              />
              <MetricsCard
                title="Avg Response Time"
                value={metrics ? `${metrics.requests.averageResponseTime}ms` : "--"}
                icon={Zap}
                color="blue"
                loading={loading}
              />
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
              {sortedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-stone-50/50 py-16">
                  <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold text-stone-700">All Clear!</h3>
                  <p className="text-sm text-stone-500">No alerts match your current filters.</p>
                </div>
              ) : (
                sortedAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onResolve={handleResolve}
                    onSnooze={handleSnooze}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "health" && (
          <motion.div
            key="health"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Overall Status */}
            <div className={`
              rounded-2xl border p-6
              ${healthStatus?.overall === "healthy" 
                ? "border-green-200 bg-green-50" 
                : healthStatus?.overall === "degraded"
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"}
            `}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`
                    flex h-16 w-16 items-center justify-center rounded-2xl
                    ${healthStatus?.overall === "healthy" 
                      ? "bg-green-100" 
                      : healthStatus?.overall === "degraded"
                      ? "bg-amber-100"
                      : "bg-red-100"}
                  `}>
                    {healthStatus?.overall === "healthy" ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : healthStatus?.overall === "degraded" ? (
                      <AlertCircle className="h-8 w-8 text-amber-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-stone-800">
                      System {healthStatus?.overall === "healthy" ? "Healthy" : healthStatus?.overall === "degraded" ? "Degraded" : "Unhealthy"}
                    </h2>
                    <p className="text-sm text-stone-500">
                      Last checked: {healthStatus?.checkedAt ? new Date(healthStatus.checkedAt).toLocaleTimeString() : "N/A"}
                    </p>
                  </div>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-stone-600 border border-stone-200 hover:bg-stone-50 transition-colors">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Health Checks */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">Service Health</h3>
              {healthStatus?.checks.map((check) => (
                <HealthStatusCard
                  key={check.name}
                  name={check.name}
                  status={check.status}
                  latency={check.latency}
                  message={check.message}
                />
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "metrics" && (
          <motion.div
            key="metrics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* System Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">System Performance</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricsCard
                  title="Uptime"
                  value={metrics ? formatUptime(metrics.uptime) : "--"}
                  icon={Clock}
                  color="green"
                  loading={loading}
                />
                <MetricsCard
                  title="Memory"
                  value={metrics ? `${metrics.memory.percentage}%` : "--"}
                  subtitle={metrics ? formatBytes(metrics.memory.used) : undefined}
                  icon={Server}
                  color={metrics && metrics.memory.percentage > 85 ? "red" : "blue"}
                  loading={loading}
                />
                <MetricsCard
                  title="CPU"
                  value={metrics ? `${metrics.cpu.usage.toFixed(0)}%` : "--"}
                  subtitle={metrics ? `${metrics.cpu.cores} cores` : undefined}
                  icon={Zap}
                  color={metrics && metrics.cpu.usage > 80 ? "red" : "amber"}
                  loading={loading}
                />
                <MetricsCard
                  title="Requests/min"
                  value={metrics ? Math.floor(metrics.requests.total / 60).toString() : "--"}
                  icon={Globe}
                  color="purple"
                  loading={loading}
                />
              </div>
            </div>

            {/* Database Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">Database</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricsCard
                  title="Connections"
                  value={metrics ? `${metrics.database.connections}/${metrics.database.maxConnections}` : "--"}
                  subtitle={metrics ? `${((metrics.database.connections / metrics.database.maxConnections) * 100).toFixed(0)}% used` : undefined}
                  icon={Database}
                  color="blue"
                  loading={loading}
                />
                <MetricsCard
                  title="Query Time"
                  value={metrics ? `${metrics.database.queryTime}ms` : "--"}
                  icon={Zap}
                  color={metrics && metrics.database.queryTime > 100 ? "red" : "green"}
                  loading={loading}
                />
                <MetricsCard
                  title="Cache Hit Rate"
                  value={metrics ? `${metrics.cache.hitRate}%` : "--"}
                  subtitle={metrics ? `${metrics.cache.hits.toLocaleString()} hits` : undefined}
                  icon={Server}
                  color={metrics && metrics.cache.hitRate > 90 ? "green" : "amber"}
                  loading={loading}
                />
              </div>
            </div>

            {/* Request Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">Requests</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <MetricsCard
                  title="Total Requests"
                  value={metrics?.requests.total.toLocaleString() || "--"}
                  icon={Globe}
                  color="blue"
                  loading={loading}
                />
                <MetricsCard
                  title="Success Rate"
                  value={metrics ? `${((metrics.requests.success / metrics.requests.total) * 100).toFixed(1)}%` : "--"}
                  icon={CheckCircle}
                  color="green"
                  loading={loading}
                />
                <MetricsCard
                  title="Error Rate"
                  value={metrics ? `${((metrics.requests.errors / metrics.requests.total) * 100).toFixed(2)}%` : "--"}
                  icon={AlertCircle}
                  color={metrics && (metrics.requests.errors / metrics.requests.total) * 100 > 5 ? "red" : "amber"}
                  loading={loading}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
