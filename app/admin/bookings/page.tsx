import { Suspense } from "react";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import BookingsPageClient from "./BookingsPageClient";
import {
  SevaBooking,
} from "@/types/seva-booking";

export const dynamic = "force-dynamic";

async function getBookings(): Promise<SevaBooking[]> {
  const { sevaBookingService } = await import("@/services/sevaBooking.service");
  return sevaBookingService.getAllBookings();
}

interface BookingsPageProps {
  searchParams: Promise<{ 
    search?: string; 
    status?: string; 
    payment?: string;
  }>;
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const params = await searchParams;
  const bookings = await getBookings();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Seva Bookings"
        description="Manage devotee bookings."
      />
      <Suspense fallback={<div className="rounded-xl border bg-white p-8">Loading bookings...</div>}>
        <BookingsPageClient bookings={bookings} />
      </Suspense>
    </div>
  );
}
