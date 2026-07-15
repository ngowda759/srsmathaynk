import type {
  Document as PrismaDocument,
  DocumentCategory as PrismaDocumentCategory,
  Media,
} from "@prisma/client";

export type { Document, DocumentCategory, Media };

// Document record
export interface DocumentRecord {
  id: string;
  title: string;
  titleKn: string | null;
  description: string | null;
  categoryId: string;
  mediaId: string;
  fileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  featured: boolean;
  active: boolean;
  order: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  // Relations
  category?: DocumentCategoryRecord | null;
  media?: Media | null;
}

// Document category record
export interface DocumentCategoryRecord {
  id: string;
  name: string;
  nameKn: string | null;
  description: string | null;
  icon: string | null;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  documentCount?: number;
}

// Document request
export interface DocumentRequest {
  title: string;
  titleKn?: string;
  description?: string;
  categoryId: string;
  mediaId: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  featured?: boolean;
  active?: boolean;
  order?: number;
}

// Category request
export interface DocumentCategoryRequest {
  name: string;
  nameKn?: string;
  description?: string;
  icon?: string;
  order?: number;
  active?: boolean;
}

// Statistics
export interface DocumentStats {
  totalDocuments: number;
  totalCategories: number;
  totalDownloads: number;
  popularDocuments: { id: string; title: string; downloadCount: number }[];
}

// Options
export const documentCategoryIcons = [
  { label: "File", value: "file" },
  { label: "PDF", value: "file-text" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Calendar", value: "calendar" },
  { label: "Announcement", value: "megaphone" },
  { label: "Download", value: "download" },
  { label: "Link", value: "link" },
];

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "Unknown";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
