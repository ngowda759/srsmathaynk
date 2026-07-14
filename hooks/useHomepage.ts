"use client";

import { useEffect, useState } from "react";

import { HomepageConfig } from "@/types/homepage";
import { homepageService } from "@/services/homepage.service";

export function useHomepage() {
  const [homepage, setHomepage] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase has been removed - use default config only
    console.log("[useHomepage] Firebase removed - using default homepage config");
    setHomepage(homepageService.getDefaultConfig());
    setLoading(false);
  }, []);

  return {
    homepage,
    loading,
  };
}
