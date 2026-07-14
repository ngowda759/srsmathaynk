"use client";

import { useEffect, useState } from "react";
import { GalleryMedia } from "@/types/gallery";

export function useGallery(
  featuredOnly = false,
  albumId?: string
) {
  const [media, setMedia] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase has been removed - return empty array
    console.log("[useGallery] Firebase removed - returning empty gallery");
    setMedia([]);
    setLoading(false);
  }, [featuredOnly, albumId]);

  return {
    media,
    loading,
  };
}
