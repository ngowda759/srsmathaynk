"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Upload, X, Image as ImageIcon, Video } from "lucide-react";

import AdminPageWrapper from "@/components/admin/common/AdminPageWrapper";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Album {
  id: string;
  title: string;
}

interface UploadFile {
  file: File;
  preview: string;
  type: "PHOTO" | "VIDEO";
}

export default function MediaUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);

  const [formData, setFormData] = useState({
    albumId: "",
    title: "",
    caption: "",
    tags: "",
    featured: false,
    showOnHome: false,
  });

  // Load albums
  useState(() => {
    async function loadAlbums() {
      try {
        const response = await fetch("/api/gallery/albums?status=PUBLISHED&limit=100");
        const data = await response.json();
        if (data.success) {
          setAlbums(data.data);
        }
      } catch (err) {
        console.error("Failed to load albums:", err);
      }
    }
    loadAlbums();
  });

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles: UploadFile[] = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith("video/") ? "VIDEO" : "PHOTO",
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  async function handleUpload() {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);

    try {
      for (const { file, type } of files) {
        // Create media item
        const response = await fetch("/api/gallery/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mediaId: "placeholder", // In real implementation, upload to storage first
            type,
            title: formData.title || file.name,
            caption: formData.caption,
            tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
            featured: formData.featured,
            showOnHome: formData.showOnHome,
          }),
        });

        const result = await response.json();

        if (result.success && formData.albumId) {
          // Add to album
          await fetch(`/api/gallery/albums/${formData.albumId}/items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId: result.data.id }),
          });
        }
      }

      toast.success(`${files.length} file(s) uploaded successfully!`);
      router.push(formData.albumId ? `/admin/gallery/albums/${formData.albumId}` : "/admin/gallery");
    } catch (err) {
      console.error("Failed to upload:", err);
      toast.error("Failed to upload files");
    } finally {
      setUploading(false);
    }
  }

  return (
    <AdminPageWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/gallery">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Upload Media</h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Select Files</h2>

              {/* File Drop Zone */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                    <Upload className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground">
                      Images (JPG, PNG, WebP) or Videos (MP4, WebM)
                    </p>
                  </div>
                </label>
              </div>

              {/* Preview */}
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Selected Files ({files.length})</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group"
                      >
                        {file.type === "VIDEO" ? (
                          <video
                            src={file.preview}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={file.preview}
                            alt={file.file.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => removeFile(index)}
                            className="bg-red-500 text-white rounded-full p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-white text-xs truncate">{file.file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Options</h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Album (Optional)</Label>
                  <Select
                    value={formData.albumId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, albumId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select album" />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.map((album) => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Default Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Applied if no filename"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={formData.caption}
                    onChange={(e) => setFormData((prev) => ({ ...prev, caption: e.target.value }))}
                    placeholder="Common caption"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.showOnHome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, showOnHome: e.target.checked }))}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Show on Homepage</span>
                  </label>
                </div>

                <Button
                  onClick={handleUpload}
                  disabled={uploading || files.length === 0}
                  className="w-full mt-4"
                >
                  {uploading ? "Uploading..." : `Upload ${files.length} File(s)`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
