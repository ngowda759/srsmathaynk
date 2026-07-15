import Link from "next/link";
import { Suspense } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import AnnouncementsPageClient from "./AnnouncementsPageClient";
import { Announcement } from "@/types/announcement";

export const dynamic = "force-dynamic";

async function getAnnouncements(): Promise<Announcement[]> {
  const { announcementService } = await import("@/services/announcement.service");
  return announcementService.getAnnouncements();
}

interface AnnouncementsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AnnouncementsPage({ searchParams }: AnnouncementsPageProps) {
  const params = await searchParams;
  const announcements = await getAnnouncements();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Announcements"
        description="Manage temple announcements."
        action={
          <Button asChild>
            <Link href="/admin/announcements/new">
              Add Announcement
            </Link>
          </Button>
        }
      />
      <Suspense fallback={<div className="rounded-xl border bg-white p-8">Loading announcements...</div>}>
        <AnnouncementsPageClient announcements={announcements} />
      </Suspense>
    </div>
  );
}
