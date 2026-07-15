"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SearchBox from "@/components/admin/common/SearchBox";
import CrudTable from "@/components/admin/crud/CrudTable";
import Button from "@/components/ui/button";

import { TempleEvent } from "@/types/event";
import { eventColumns } from "./columns";

export default function EventsPage() {
  const [events, setEvents] = useState<TempleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const result = await response.json();
      
      if (result.success && result.data) {
        setEvents(result.data);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = events.filter((event) => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return true;
    return (
      event.title.toLowerCase().includes(keyword) ||
      (event.description && event.description.toLowerCase().includes(keyword)) ||
      (event.location && event.location.toLowerCase().includes(keyword))
    );
  });

  async function handleDelete(event: TempleEvent) {
    if (!event.id) return;

    if (
      !window.confirm(
        `Delete "${event.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast.success("Event deleted successfully.");
      await loadEvents();
    } catch (error) {
      console.error("Failed to delete event:", error);
      toast.error("Failed to delete event.");
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Temple Events"
        description="Manage temple events, festivals, and special occasions."
        action={
          <Button asChild>
            <Link href="/admin/events/new">Add Event</Link>
          </Button>
        }
      />

      <SearchBox
        value={search}
        onChange={setSearch}
        placeholder="Search events by title, location, or description..."
      />

      {loading ? (
        <div className="rounded-xl border bg-white p-8">
          Loading events...
        </div>
      ) : (
        <CrudTable<TempleEvent>
          data={filteredEvents}
          columns={eventColumns}
          emptyMessage="No events found."
          actions={{
            onEdit: (event) => {
              window.location.href = `/admin/events/${event.id}/edit`;
            },
            onDelete: handleDelete,
          }}
        />
      )}
    </div>
  );
}
