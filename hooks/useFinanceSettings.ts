"use client";

import { useState } from "react";
import { FinanceSettings, defaultFinanceSettings } from "@/types/finance";

export function useFinanceSettings() {
  const [settings] = useState<FinanceSettings>(defaultFinanceSettings);
  const [loading] = useState(false);

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
