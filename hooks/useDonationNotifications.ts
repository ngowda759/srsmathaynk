"use client";

import { useState, useEffect } from "react";

interface DonationNotification {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  paymentMode: string;
  createdAt: Date;
}

export function useDonationNotifications() {
  const [notifications, setNotifications] = useState<DonationNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Firebase has been removed - return empty notifications
    console.log("[useDonationNotifications] Firebase removed - returning empty notifications");
    setNotifications([]);
    setUnreadCount(0);
    setLoading(false);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
