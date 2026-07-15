"use client";

import { useState } from "react";
import { GalleryMedia } from "@/types/gallery";

export function useGallery(
  _featuredOnly = false,
  _albumId?: string
) {
  const [media] = useState<GalleryMedia[]>([]);
  const [loading] = useState(false);

  return {
    media,
    loading,
  };
}
