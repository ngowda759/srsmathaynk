"use client";

import { useState, useEffect } from "react";
import { FinanceSettings, defaultFinanceSettings } from "@/types/finance";

const SETTINGS_DOC = "financeSettings";
const SETTINGS_COLLECTION = "settings";

export function useFinanceSettings() {
  const [settings, setSettings] = useState<FinanceSettings>(defaultFinanceSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase has been removed - use default settings
    console.log("[useFinanceSettings] Firebase removed - using default settings");
    setSettings(defaultFinanceSettings);
    setLoading(false);
  }, []);

  const activeSevas = settings.specialSevas
    .filter(s => s.isActive)
    .sort((a, b) => a.order - b.order);

  return {
    settings,
    loading,
    enabled: settings.enabled,
    upiEnabled: settings.upi.enabled,
    bankTransferEnabled: settings.bankTransfer.enabled,
    upiDetails: settings.upi,
    bankDetails: settings.bankTransfer,
    specialSevas: activeSevas,
  };
}
