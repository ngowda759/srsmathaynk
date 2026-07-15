"use client";

import { useState } from "react";

import { HomepageConfig } from "@/types/homepage";
import { homepageService } from "@/services/homepage.service";

export function useHomepage() {
  const [homepage] = useState<HomepageConfig | null>(homepageService.getDefaultConfig());
  const [loading] = useState(false);

  return {
    homepage,
    loading,
  };
}
