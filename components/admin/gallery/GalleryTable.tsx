"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Trash2,
  Star,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { GalleryItem } from "@/types/gallery";
import { galleryService } from "@/services/gallery.service";

interface GalleryTableProps {
  items: GalleryItem[];
  onRefresh: () => void;
}

export default function GalleryTable({ items, onRefresh }: GalleryTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await galleryService.deleteImage(deleteId);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete item:", err);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await galleryService.updateImage(id, { featured: !current });
      onRefresh();
    } catch (err) {
      console.error("Failed to toggle featured:", err);
    }
  }

  function formatDate(iso?: Date | string) {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  No items found. Upload media to get started.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="relative block h-12 w-12 overflow-hidden rounded-lg border"
                    >
                      {item.media?.url ? (
                        <Image
                          src={item.media.url}
                          alt={item.altText || item.title || "Gallery item"}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                          {item.type === "VIDEO" ? "🎬" : "🖼"}
                        </div>
                      )}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.title || "Untitled"}</div>
                    <div className="max-w-xs truncate text-xs text-muted-foreground">
                      {item.caption || item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium bg-secondary text-secondary-foreground">
                      {item.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFeatured(item.id, item.featured)}
                      className={
                        item.featured
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      <Star
                        className="h-4 w-4"
                        fill={item.featured ? "currentColor" : "none"}
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPreviewItem(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              This will permanently delete this gallery item and remove it from any albums.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!previewItem}
        onOpenChange={() => setPreviewItem(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title || "Untitled"}</DialogTitle>
            <DialogDescription>{previewItem?.caption || previewItem?.description}</DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
              {previewItem.type === "VIDEO" ? (
                <video
                  src={previewItem.media?.url}
                  controls
                  className="h-full w-full object-contain"
                />
              ) : (
                <Image
                  src={previewItem.media?.url || ""}
                  alt={previewItem.altText || previewItem.title || ""}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 700px"
                />
              )}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {previewItem?.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
