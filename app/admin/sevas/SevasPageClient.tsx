"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Star, Calendar, BarChart3, Users } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { SevaRecord, SevaStats } from "@/types/seva";

interface SevasPageClientProps {
  sevas: SevaRecord[];
  stats: SevaStats;
}

export default function SevasPageClient({ sevas: initialSevas, stats: initialStats }: SevasPageClientProps) {
  const router = useRouter();
  const [sevas, setSevas] = useState<SevaRecord[]>(initialSevas);
  const [stats, setStats] = useState<SevaStats | null>(initialStats);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sevasResult, statsData] = await Promise.all([
        fetch("/api/sevas?active=true").then(res => res.json()),
        fetch("/api/sevas/stats").then(res => res.json()),
      ]);
      if (sevasResult.success) setSevas(sevasResult.data.sevas);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error("Failed to load sevas:", error);
      toast.error("Failed to load sevas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSevas.length === 0) {
      loadData();
    }
  }, [loadData, initialSevas.length]);

  const filteredSevas = sevas.filter((seva) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;
    return (
      seva.name.toLowerCase().includes(keyword) ||
      seva.category?.toLowerCase().includes(keyword) ||
      seva.description?.toLowerCase().includes(keyword)
    );
  });

  async function toggleFeatured(seva: SevaRecord) {
    try {
      await fetch(`/api/sevas/${seva.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !seva.featured }),
      });
      toast.success(`Seva ${seva.featured ? "unfeatured" : "featured"}.`);
      await loadData();
    } catch (error) {
      toast.error("Failed to update.");
    }
  }

  async function toggleActive(seva: SevaRecord) {
    try {
      await fetch(`/api/sevas/${seva.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !seva.active }),
      });
      toast.success(`Seva ${seva.active ? "deactivated" : "activated"}.`);
      await loadData();
    } catch (error) {
      toast.error("Failed to update.");
    }
  }

  async function handleDelete(seva: SevaRecord) {
    if (!window.confirm(`Delete "${seva.name}"?`)) return;
    try {
      await fetch(`/api/sevas/${seva.id}`, { method: "DELETE" });
      toast.success("Seva deleted.");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete.");
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Seva Management"
        description="Manage temple sevas, bookings, and availability."
        action={
          <Button asChild>
            <Link href="/admin/sevas/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Seva
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Sevas</p>
              <p className="text-2xl font-bold">{sevas.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Bookings</p>
              <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <BarChart3 className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Today</p>
              <p className="text-2xl font-bold">{stats?.todayBookings || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Revenue</p>
              <p className="text-2xl font-bold">₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search sevas by name, category..."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/bookings">
              View Bookings
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/aaradhane">
              Aaradhanes
            </Link>
          </Button>
        </div>
      </div>

      {/* Sevas Grid */}
      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading sevas...
        </div>
      ) : filteredSevas.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <p className="text-stone-500">No sevas found.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/sevas/new">
              <Plus className="mr-2 h-4 w-4" />
              Add First Seva
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSevas.map((seva) => (
            <div
              key={seva.id}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{seva.name}</h3>
                    {seva.featured && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  {seva.category && (
                    <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                      {seva.category}
                    </span>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    seva.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {seva.active ? "Active" : "Inactive"}
                </span>
              </div>

              {seva.description && (
                <p className="mb-4 text-sm text-stone-600 line-clamp-2">
                  {seva.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Price</span>
                  <span className="font-semibold text-green-700">
                    ₹{seva.price.toLocaleString()}
                  </span>
                </div>
                {seva.duration && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Duration</span>
                    <span>{seva.duration}</span>
                  </div>
                )}
                {seva.maxPerDay && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Daily Limit</span>
                    <span>{seva.maxPerDay}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <Button size="sm" variant="outline" onClick={() => toggleFeatured(seva)}>
                  <Star className={`h-4 w-4 ${seva.featured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                </Button>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/sevas/${seva.id}`)}
                  >
                    View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/admin/sevas/${seva.id}/edit`)}
                  >
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(seva)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
