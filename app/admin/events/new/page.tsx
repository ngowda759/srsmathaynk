import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import EventForm from "@/components/admin/events/EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Create Event"
        description="Create a new temple event."
      />

      <EventForm />
    </div>
  );
}
