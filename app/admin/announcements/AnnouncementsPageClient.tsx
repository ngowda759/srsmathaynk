"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import SearchBox from "@/components/admin/common/SearchBox";
import CrudTable from "@/components/admin/crud/CrudTable";
import { Announcement } from "@/types/announcement";
import { announcementColumns } from "./columns";

interface AnnouncementsPageClientProps {
  announcements: Announcement[];
}

export default function AnnouncementsPageClient({ announcements: initialAnnouncements }: AnnouncementsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [announcements] = useState(initialAnnouncements);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/announcements?${params.toString()}`);
  };

  const filteredAnnouncements = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return announcements;
    return announcements.filter((item) =>
      [item.title, item.message, item.link ?? ""].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }, [announcements, search]);

  async function handleDelete(announcement: Announcement) {
    if (!window.confirm(`Delete "${announcement.title}"?`)) {
      return;
    }
    try {
      const { announcementService } = await import("@/services/announcement.service");
      await announcementService.deleteAnnouncement(announcement.id);
      toast.success("Announcement deleted successfully.");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      toast.error("Failed to delete announcement.");
    }
  }

  return (
    <>
      <SearchBox
        value={search}
        onChange={handleSearchChange}
        placeholder="Search announcements..."
      />
      <CrudTable<Announcement>
        data={filteredAnnouncements}
        columns={announcementColumns}
        emptyMessage="No announcements found."
        actions={{
          onEdit: (announcement) => router.push(`/admin/announcements/${announcement.id}/edit`),
          onDelete: handleDelete,
        }}
      />
    </>
  );
}
