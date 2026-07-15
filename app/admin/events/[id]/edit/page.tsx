import { notFound } from "next/navigation";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import EventForm from "@/components/admin/events/EventForm";
import { eventService } from "@/services/event.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({
  params,
}: Props) {
  const { id } = await params;

  const event = await eventService.getEvent(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Edit Event"
        description="Update temple event information."
      />

      <EventForm
        mode="edit"
        initialData={event}
      />
    </div>
  );
}
