/**
 * Notification Service for Alerts
 * Handles sending notifications via email, Slack, and webhooks
 */

import type { Alert, NotificationChannel, EmailNotificationConfig, SlackNotificationConfig } from "@/types/monitoring";

export interface NotificationPayload {
  alert: Alert;
  timestamp: Date;
  recipient?: string;
}

export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  recipient: string;
  error?: string;
  sentAt: Date;
}

/**
 * Send email notification for an alert
 */
export async function sendEmailNotification(
  alert: Alert,
  config: EmailNotificationConfig
): Promise<NotificationResult> {
  const timestamp = new Date();
  
  if (!config.enabled || !config.toAddresses.length) {
    return {
      success: false,
      channel: "email",
      recipient: "not configured",
      error: "Email notifications are disabled or no recipients configured",
      sentAt: timestamp,
    };
  }

  const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
  const body = formatAlertEmailBody(alert);

  try {
    // In a real implementation, this would call a backend API or use a service like SendGrid, Resend, etc.
    // For now, we simulate the notification
    console.log("Email notification sent:", {
      to: config.toAddresses,
      subject,
      body,
    });

    return {
      success: true,
      channel: "email",
      recipient: config.toAddresses.join(", "),
      sentAt: timestamp,
    };
  } catch (error) {
    return {
      success: false,
      channel: "email",
      recipient: config.toAddresses.join(", "),
      error: error instanceof Error ? error.message : "Unknown error",
      sentAt: timestamp,
    };
  }
}

/**
 * Send Slack notification for an alert
 */
export async function sendSlackNotification(
  alert: Alert,
  config: SlackNotificationConfig
): Promise<NotificationResult> {
  const timestamp = new Date();
  
  if (!config.enabled || !config.webhookUrl) {
    return {
      success: false,
      channel: "slack",
      recipient: "not configured",
      error: "Slack notifications are disabled or webhook URL not configured",
      sentAt: timestamp,
    };
  }

  const payload = formatSlackPayload(alert, config);

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return {
      success: true,
      channel: "slack",
      recipient: config.channel || "webhook",
      sentAt: timestamp,
    };
  } catch (error) {
    return {
      success: false,
      channel: "slack",
      recipient: config.channel || "webhook",
      error: error instanceof Error ? error.message : "Unknown error",
      sentAt: timestamp,
    };
  }
}

/**
 * Send webhook notification for an alert
 */
export async function sendWebhookNotification(
  alert: Alert,
  webhookUrl: string,
  secret?: string
): Promise<NotificationResult> {
  const timestamp = new Date();
  
  if (!webhookUrl) {
    return {
      success: false,
      channel: "webhook",
      recipient: "not configured",
      error: "Webhook URL not configured",
      sentAt: timestamp,
    };
  }

  const payload = formatWebhookPayload(alert);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add signature if secret is configured
  if (secret) {
    const crypto = await import("crypto");
    const signature = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(payload))
      .digest("hex");
    headers["X-Signature"] = signature;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    return {
      success: true,
      channel: "webhook",
      recipient: webhookUrl,
      sentAt: timestamp,
    };
  } catch (error) {
    return {
      success: false,
      channel: "webhook",
      recipient: webhookUrl,
      error: error instanceof Error ? error.message : "Unknown error",
      sentAt: timestamp,
    };
  }
}

/**
 * Send SMS notification for an alert (placeholder)
 */
export async function sendSMSNotification(
  alert: Alert,
  phoneNumber: string
): Promise<NotificationResult> {
  const timestamp = new Date();
  
  if (!phoneNumber) {
    return {
      success: false,
      channel: "sms",
      recipient: "not configured",
      error: "Phone number not configured",
      sentAt: timestamp,
    };
  }

  // In a real implementation, this would use a service like Twilio, AWS SNS, etc.
  const message = `[${alert.severity.toUpperCase()}] ${alert.title}: ${alert.description.substring(0, 100)}`;
  
  try {
    console.log("SMS notification sent:", { to: phoneNumber, message });
    
    return {
      success: true,
      channel: "sms",
      recipient: phoneNumber,
      sentAt: timestamp,
    };
  } catch (error) {
    return {
      success: false,
      channel: "sms",
      recipient: phoneNumber,
      error: error instanceof Error ? error.message : "Unknown error",
      sentAt: timestamp,
    };
  }
}

/**
 * Send push notification (placeholder)
 */
export async function sendPushNotification(
  alert: Alert,
  deviceToken: string
): Promise<NotificationResult> {
  const timestamp = new Date();
  
  // In a real implementation, this would use Firebase Cloud Messaging or similar
  try {
    console.log("Push notification sent:", { to: deviceToken, alert: alert.title });
    
    return {
      success: true,
      channel: "push",
      recipient: deviceToken,
      sentAt: timestamp,
    };
  } catch (error) {
    return {
      success: false,
      channel: "push",
      recipient: deviceToken,
      error: error instanceof Error ? error.message : "Unknown error",
      sentAt: timestamp,
    };
  }
}

/**
 * Format alert email body
 */
function formatAlertEmailBody(alert: Alert): string {
  return `
Sri Raghavendra Swamy Temple Portal - Alert Notification

==============================================
${alert.severity.toUpperCase()} ALERT
==============================================

Title: ${alert.title}

Description:
${alert.description}

Details:
- Category: ${alert.category}
- Source: ${alert.source}
- Status: ${alert.status}
- Created: ${new Date(alert.createdAt).toLocaleString()}

${alert.metadata ? `\nAdditional Info:\n${JSON.stringify(alert.metadata, null, 2)}` : ""}

---
This is an automated alert from the Sri Raghavendra Swamy Temple Portal.
Please take appropriate action.
  `.trim();
}

/**
 * Format Slack message payload
 */
function formatSlackPayload(alert: Alert, config: SlackNotificationConfig): Record<string, unknown> {
  const severityEmoji: Record<string, string> = {
    critical: ":rotating_light:",
    high: ":warning:",
    medium: ":large_yellow_circle:",
    low: ":information_source:",
    info: ":speech_balloon:",
  };

  const blocks: Record<string, unknown>[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${severityEmoji[alert.severity]} ${alert.title}`,
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Severity:*\n${alert.severity}` },
        { type: "mrkdwn", text: `*Category:*\n${alert.category}` },
        { type: "mrkdwn", text: `*Status:*\n${alert.status}` },
        { type: "mrkdwn", text: `*Source:*\n${alert.source}` },
      ],
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: alert.description,
      },
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Alert ID: ${alert.id} | Created: ${new Date(alert.createdAt).toLocaleString()}`,
        },
      ],
    },
  ];

  // Add mention for critical alerts
  if (config.mentionOnCritical && alert.severity === "critical") {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "<!channel> Immediate attention required!",
      },
    });
  }

  return { blocks };
}

/**
 * Format webhook payload
 */
function formatWebhookPayload(alert: Alert): Record<string, unknown> {
  return {
    event: "alert",
    alert: {
      id: alert.id,
      title: alert.title,
      description: alert.description,
      severity: alert.severity,
      status: alert.status,
      category: alert.category,
      source: alert.source,
      createdAt: alert.createdAt,
      metadata: alert.metadata,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send notifications through all configured channels
 */
export async function sendAlertNotifications(
  alert: Alert,
  channels: NotificationChannel[],
  configs: {
    email?: EmailNotificationConfig;
    slack?: SlackNotificationConfig;
    webhookUrl?: string;
    webhookSecret?: string;
  }
): Promise<NotificationResult[]> {
  const results: NotificationResult[] = [];

  for (const channel of channels) {
    switch (channel) {
      case "email":
        if (configs.email) {
          results.push(await sendEmailNotification(alert, configs.email));
        }
        break;
      case "slack":
        if (configs.slack) {
          results.push(await sendSlackNotification(alert, configs.slack));
        }
        break;
      case "webhook":
        if (configs.webhookUrl) {
          results.push(await sendWebhookNotification(alert, configs.webhookUrl, configs.webhookSecret));
        }
        break;
      case "sms":
        // Would need phone number configuration
        break;
      case "push":
        // Would need device token configuration
        break;
    }
  }

  return results;
}
