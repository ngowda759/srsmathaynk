import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SevasBookingsPageClient from "./SevasBookingsPageClient";
import { SevaBooking } from "@/types/seva-booking";

export const dynamic = "force-dynamic";

async function getBookings(): Promise<SevaBooking[]> {
  const { sevaBookingService } = await import("@/services/sevaBooking.service");
  return sevaBookingService.getAllBookings();
}

interface SevasBookingsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminSevasPage({ searchParams }: SevasBookingsPageProps) {
  const params = await searchParams;
  const bookings = await getBookings();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Special Sevas"
        description="View and manage online seva booking requests."
      />
      <SevasBookingsPageClient bookings={bookings} />
    </div>
  );
}
