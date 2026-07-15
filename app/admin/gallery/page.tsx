"use client";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AdminPageWrapper from "@/components/admin/common/AdminPageWrapper";
import GalleryDashboard from "@/components/admin/gallery/GalleryDashboard";
import Link from "next/link";
import Button from "@/components/ui/button";

export default function AdminGalleryPage() {
  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        <AdminPageHeader
          title="Gallery Management"
          description="Manage albums, photos, and videos. Create albums to organize your media."
          action={
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/admin/gallery/albums/new">Create Album</Link>
              </Button>
              <Button asChild>
                <Link href="/admin/gallery/media/upload">Upload Media</Link>
              </Button>
            </div>
          }
        />

        <GalleryDashboard />
      </div>
    </AdminPageWrapper>
  );
}
