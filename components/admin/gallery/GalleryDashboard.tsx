"use client";

import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import {
  GalleryAlbumType,
  GalleryItemType,
  GalleryStats,
} from "@/types/gallery";

interface GalleryDashboardProps {
  initialAlbums?: GalleryAlbumType[];
  initialStats?: GalleryStats;
}

export default function GalleryDashboard({ initialAlbums, initialStats }: GalleryDashboardProps) {
  const [albums, setAlbums] = useState<GalleryAlbumType[]>(initialAlbums || []);
  const [items, setItems] = useState<GalleryItemType[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(initialStats || null);
  const [loading, setLoading] = useState(!initialAlbums);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryFilter) params.set("categoryId", categoryFilter);
      if (statusFilter) params.set("status", statusFilter);

      const [albumsRes, itemsRes, statsRes] = await Promise.all([
        fetch(`/api/gallery/albums?${params}`),
        fetch("/api/gallery/items"),
        fetch("/api/gallery/stats"),
      ]);

      const [albumsData, itemsData, statsData] = await Promise.all([
        albumsRes.json(),
        itemsRes.json(),
        statsRes.json(),
      ]);

      if (albumsData.success) setAlbums(albumsData.data);
      if (itemsData.success) setItems(itemsData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (err: any) {
      console.error("Failed to load gallery:", err);
      setError(err?.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleToggleFeatured(albumId: string, current: boolean) {
    try {
      const response = await fetch(`/api/gallery/albums/${albumId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleFeatured" }),
      });

      const result = await response.json();
      if (result.success) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, featured: !current } : a))
        );
        toast.success(result.message);
      }
    } catch (err) {
      console.error("Failed to toggle featured:", err);
      toast.error("Failed to toggle featured");
    }
  }

  async function handleTogglePublished(albumId: string, current: boolean) {
    try {
      const response = await fetch(`/api/gallery/albums/${albumId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "togglePublished" }),
      });

      const result = await response.json();
      if (result.success) {
        setAlbums((prev) =>
          prev.map((a) => (a.id === albumId ? { ...a, published: !current } : a))
        );
        toast.success(result.message);
      }
    } catch (err) {
      console.error("Failed to toggle published:", err);
      toast.error("Failed to toggle published");
    }
  }

  async function handleDeleteAlbum(albumId: string) {
    if (!confirm("Are you sure you want to delete this album?")) return;

    try {
      const response = await fetch(`/api/gallery/albums/${albumId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setAlbums((prev) => prev.filter((a) => a.id !== albumId));
        toast.success("Album deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete album:", err);
      toast.error("Failed to delete album");
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/gallery/items/${itemId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (result.success) {
        setItems((prev) => prev.filter((i) => i.id !== itemId));
        toast.success("Item deleted successfully");
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
      toast.error("Failed to delete item");
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        Loading Gallery...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const isEmpty = albums.length === 0 && items.length === 0;

  return (
    <div className="space-y-8">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Albums" value={stats.albums} />
          <StatCard label="Photos" value={stats.photos} />
          <StatCard label="Videos" value={stats.videos} />
          <StatCard label="Featured" value={stats.featured} />
          <StatCard label="Total Items" value={stats.total} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search albums..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-lg border px-3 py-2"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button
          onClick={loadData}
          className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600"
        >
          Refresh
        </button>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="text-gray-500 mb-4">No gallery items yet. Create your first album!</p>
          <a
            href="/admin/gallery/albums/new"
            className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 inline-block"
          >
            Create Album
          </a>
        </div>
      )}

      {/* Albums */}
      {albums.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Albums ({albums.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                onToggleFeatured={() => handleToggleFeatured(album.id, album.featured)}
                onTogglePublished={() => handleTogglePublished(album.id, album.published)}
                onDelete={() => handleDeleteAlbum(album.id)}
                onView={() => window.location.href = `/admin/gallery/albums/${album.id}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Items without album */}
      {items.filter(i => !i.albumIds?.length).length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Unassigned Items ({items.filter(i => !i.albumIds?.length).length})</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {items.filter(i => !i.albumIds?.length).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4 text-center">
      <div className="text-2xl font-bold text-orange-500">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// Album Card Component
function AlbumCard({
  album,
  onToggleFeatured,
  onTogglePublished,
  onDelete,
  onView,
}: {
  album: GalleryAlbumType;
  onToggleFeatured: () => void;
  onTogglePublished: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="aspect-video bg-gray-100 relative">
        {album.coverImage?.url ? (
          <img
            src={album.coverImage.url}
            alt={album.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Cover
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          {album.featured && (
            <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded">⭐</span>
          )}
          <span className={`text-xs px-2 py-1 rounded ${album.published ? "bg-green-500 text-white" : "bg-gray-400 text-white"}`}>
            {album.status}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold truncate">{album.title}</h3>
        {album.category && (
          <p className="text-sm text-muted-foreground">{album.category.name}</p>
        )}
        <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
          <span>📷 {album.photoCount}</span>
          <span>🎬 {album.videoCount}</span>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onToggleFeatured}
            className={`text-xs px-2 py-1 rounded ${album.featured ? "bg-yellow-100 text-yellow-700" : "bg-gray-100"}`}
            title="Toggle Featured"
          >
            ⭐
          </button>
          <button
            onClick={onTogglePublished}
            className={`text-xs px-2 py-1 rounded ${album.published ? "bg-green-100 text-green-700" : "bg-gray-100"}`}
            title="Toggle Published"
          >
            👁
          </button>
          <button
            onClick={onView}
            className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700"
          >
            View
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded bg-red-100 text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Item Card Component
function ItemCard({
  item,
  onDelete,
}: {
  item: GalleryItemType;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border bg-white overflow-hidden relative group">
      <div className="aspect-square bg-gray-100 relative">
        {item.media?.url ? (
          <img
            src={item.media.url}
            alt={item.title || "Gallery item"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            {item.type === "VIDEO" ? "🎬" : "📷"}
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onDelete}
            className="bg-red-500 text-white text-xs px-2 py-1 rounded"
          >
            Delete
          </button>
        </div>
      </div>
      {item.title && (
        <div className="p-2">
          <p className="text-xs truncate">{item.title}</p>
        </div>
      )}
    </div>
  );
}
