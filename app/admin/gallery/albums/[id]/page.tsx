"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Upload, Trash2, Star, Eye } from "lucide-react";

import AdminPageWrapper from "@/components/admin/common/AdminPageWrapper";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Label from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { GalleryAlbumType, GalleryItemType, AlbumStats } from "@/types/gallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AlbumDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  
  const [album, setAlbum] = useState<GalleryAlbumType | null>(null);
  const [items, setItems] = useState<GalleryItemType[]>([]);
  const [stats, setStats] = useState<AlbumStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    titleKn: "",
    description: "",
    descriptionKn: "",
    categoryId: "",
    status: "DRAFT" as const,
    visibility: "PRIVATE" as const,
    featured: false,
    published: false,
    location: "",
    eventDate: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [albumRes, itemsRes, statsRes, catRes] = await Promise.all([
          fetch(`/api/gallery/albums/${id}`),
          fetch(`/api/gallery/albums/${id}/items`),
          fetch(`/api/gallery/stats?albumId=${id}`),
          fetch("/api/gallery/categories"),
        ]);

        const [albumData, itemsData, statsData, catData] = await Promise.all([
          albumRes.json(),
          itemsRes.json(),
          statsRes.json(),
          catRes.json(),
        ]);

        if (albumData.success) {
          setAlbum(albumData.data);
          const a = albumData.data;
          setFormData({
            title: a.title || "",
            titleKn: a.titleKn || "",
            description: a.description || "",
            descriptionKn: a.descriptionKn || "",
            categoryId: a.categoryId || "",
            status: a.status,
            visibility: a.visibility,
            featured: a.featured,
            published: a.published,
            location: a.location || "",
            eventDate: a.eventDate ? new Date(a.eventDate).toISOString().split("T")[0] : "",
          });
        }

        if (itemsData.success) {
          setItems(itemsData.data);
        }

        if (statsData.success) {
          setStats(statsData.data);
        }

        if (catData.success) {
          setCategories(catData.data);
        }
      } catch (err) {
        console.error("Failed to load album:", err);
        toast.error("Failed to load album");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch(`/api/gallery/albums/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          eventDate: formData.eventDate || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Album saved successfully!");
        setAlbum(result.data);
      } else {
        toast.error(result.error || "Failed to save album");
      }
    } catch (err) {
      console.error("Failed to save album:", err);
      toast.error("Failed to save album");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this album?")) return;

    try {
      const response = await fetch(`/api/gallery/albums/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Album deleted successfully!");
        router.push("/admin/gallery");
      } else {
        toast.error(result.error || "Failed to delete album");
      }
    } catch (err) {
      console.error("Failed to delete album:", err);
      toast.error("Failed to delete album");
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!confirm("Remove this item from album?")) return;

    try {
      const response = await fetch(`/api/gallery/albums/${id}/items?itemId=${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.success("Item removed from album");
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item");
    }
  }

  if (loading) {
    return (
      <AdminPageWrapper>
        <div className="rounded-xl border bg-white p-10 text-center">
          Loading album...
        </div>
      </AdminPageWrapper>
    );
  }

  if (!album) {
    return (
      <AdminPageWrapper>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 mb-4">Album not found</p>
          <Button onClick={() => router.push("/admin/gallery")}>
            Back to Gallery
          </Button>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/gallery">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{album.title}</h1>
              <div className="flex gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded ${album.published ? "bg-green-100 text-green-700" : "bg-gray-100"}`}>
                  {album.status}
                </span>
                {album.featured && <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">⭐ Featured</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
            <Button asChild>
              <Link href={`/gallery/album/${album.slug}`} target="_blank">
                <Eye className="h-4 w-4 mr-1" /> View Public
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6 rounded-xl border bg-white p-6">
            <h2 className="text-lg font-semibold">Album Details</h2>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titleKn">Title (Kannada)</Label>
                  <Input
                    id="titleKn"
                    value={formData.titleKn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, titleKn: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as typeof formData.status }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, eventDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span>Published</span>
                </label>
              </div>

              <Button onClick={handleSave} disabled={saving} className="mt-4">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>

          {/* Stats & Info */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Album Stats</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-medium">{stats?.totalItems || items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium">{stats?.photos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Videos</span>
                  <span className="font-medium">{stats?.videos || 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Items ({items.length})</h2>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No items in this album yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {items.map((item) => (
                    <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border bg-gray-50">
                      {item.media?.url ? (
                        <img
                          src={item.media.url}
                          alt={item.title || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          {item.type === "VIDEO" ? "🎬" : "📷"}
                        </div>
                      )}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
