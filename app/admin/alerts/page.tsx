import type { Metadata } from "next";
import AlertsPageClient from "./AlertsPageClient";

export const metadata: Metadata = {
  title: "Alerts & Monitoring | Admin",
  description: "System alerts, monitoring dashboard, and health checks",
};

export default function AlertsPage() {
  return <AlertsPageClient />;
}
