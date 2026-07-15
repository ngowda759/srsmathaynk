"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import SearchBox from "@/components/admin/common/SearchBox";
import CrudTable from "@/components/admin/crud/CrudTable";
import { bookingColumns } from "./columns";
import { SevaBooking, SevaBookingStatus, PaymentStatus } from "@/types/seva-booking";

interface BookingsPageClientProps {
  bookings: SevaBooking[];
}

export default function BookingsPageClient({ bookings: initialBookings }: BookingsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookings] = useState(initialBookings);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<SevaBookingStatus | "all">(
    (searchParams.get("status") as SevaBookingStatus | "all") || "all"
  );
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | "all">(
    (searchParams.get("payment") as PaymentStatus | "all") || "all"
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const handleStatusChange = (value: SevaBookingStatus | "all") => {
    setStatusFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set("status", value);
    } else {
      params.delete("status");
    }
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const handlePaymentChange = (value: PaymentStatus | "all") => {
    setPaymentFilter(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value !== "all") {
      params.set("payment", value);
    } else {
      params.delete("payment");
    }
    router.push(`/admin/bookings?${params.toString()}`);
  };

  const filteredBookings = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return bookings.filter((booking) => {
      const matchesSearch =
        !keyword ||
        [
          booking.sevaTitle,
          booking.userName,
          booking.userEmail,
          booking.userPhone,
          booking.paymentReference,
        ].some((value) => value.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
      const matchesPayment = paymentFilter === "all" || booking.paymentStatus === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [bookings, search, statusFilter, paymentFilter]);

  async function updateStatus(booking: SevaBooking, status: SevaBookingStatus) {
    try {
      const { sevaBookingService } = await import("@/services/sevaBooking.service");
      await sevaBookingService.updateBookingStatus(booking.id, status);
      toast.success("Status updated.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update status.");
    }
  }

  async function handleDelete(booking: SevaBooking) {
    if (!window.confirm(`Delete booking for ${booking.userName}?`)) {
      return;
    }
    try {
      const { sevaBookingService } = await import("@/services/sevaBooking.service");
      await sevaBookingService.deleteBooking(booking.id);
      toast.success("Booking deleted.");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete booking.");
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={handleSearchChange}
            placeholder="Search bookings..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusChange(e.target.value as SevaBookingStatus | "all")}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => handlePaymentChange(e.target.value as PaymentStatus | "all")}
          className="rounded-xl border border-stone-300 bg-white px-4 py-3"
        >
          <option value="all">All Payments</option>
          <option value="pending">Payment Pending</option>
          <option value="completed">Payment Done</option>
          <option value="failed">Payment Failed</option>
        </select>
      </div>
      <CrudTable<SevaBooking>
        data={filteredBookings}
        columns={bookingColumns}
        emptyMessage="No bookings found."
        actions={{
          onView: (booking) => router.push(`/admin/bookings/${booking.id}`),
          onEdit: (booking) => updateStatus(booking, "confirmed"),
          onDelete: handleDelete,
        }}
      />
    </>
  );
}
