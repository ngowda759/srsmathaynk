"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { TempleEvent, EventRequest, EventType, EVENT_TYPE_LABELS } from "@/types/event";

import FormContainer from "@/components/ui/form/FormContainer";
import FormSection from "@/components/ui/form/FormSection";
import FormTextField from "@/components/ui/form/FormTextField";
import FormTextArea from "@/components/ui/form/FormTextArea";
import FormSelectField from "@/components/ui/form/FormSelectField";
import FormSwitchField from "@/components/ui/form/FormSwitchField";
import FormActions from "@/components/ui/form/FormActions";
import FormNumberField from "@/components/ui/form/FormNumberField";

interface EventFormProps {
  mode?: "create" | "edit";
  initialData?: TempleEvent;
}

function toJsDate(
  value: Date | string | number | null | undefined
): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

function toDateTimeInputs(
  timestamp?: Date | string | null
) {
  const d = toJsDate(timestamp);

  if (!d) {
    return { date: "", time: "" };
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`;

  return { date, time };
}

function toISODate(date: string, time: string | undefined): string | null {
  if (!date) return null;

  const [hours, minutes] = time ? time.split(":").map(Number) : [0, 0];
  const [year, month, day] = date.split("-").map(Number);

  const combined = new Date(year, month - 1, day, hours || 0, minutes || 0);

  return combined.toISOString();
}

const eventTypeOptions = Object.entries(EVENT_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export default function EventForm({
  mode = "create",
  initialData,
}: EventFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const initialStart = toDateTimeInputs(initialData?.startDate);
  const initialEnd = toDateTimeInputs(initialData?.endDate);

  const [form, setForm] = useState<EventRequest>({
    title: initialData?.title ?? "",
    titleKn: initialData?.titleKn ?? "",
    description: initialData?.description ?? "",
    descriptionKn: initialData?.descriptionKn ?? "",
    location: initialData?.location ?? "",
    startDate: initialStart.date,
    startTime: initialStart.time,
    endDate: initialEnd.date,
    endTime: initialEnd.time,
    isOnline: initialData?.isOnline ?? false,
    onlineLink: initialData?.onlineLink ?? "",
    type: initialData?.type ?? "GENERAL",
    featured: initialData?.featured ?? false,
    published: initialData?.published ?? false,
    maxAttendees: initialData?.maxAttendees ?? undefined,
    organizer: initialData?.organizer ?? "",
    contactPhone: initialData?.contactPhone ?? "",
    contactEmail: initialData?.contactEmail ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateField<K extends keyof EventRequest>(
    key: K,
    value: EventRequest[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  }

  function validate() {
    const validationErrors: Record<string, string> = {};

    if (!form.title || form.title.trim().length < 3) {
      validationErrors.title = "Title must contain at least 3 characters.";
    }

    if (!form.description || form.description.trim().length < 10) {
      validationErrors.description = "Description must contain at least 10 characters.";
    }

    if (form.isOnline && form.onlineLink && !form.onlineLink.startsWith("http")) {
      validationErrors.onlineLink = "Online link must start with http:// or https://";
    }

    if (!form.startDate) {
      validationErrors.startDate = "Start date is required.";
    }

    if (!form.endDate) {
      validationErrors.endDate = "End date is required.";
    }

    if (form.startDate && form.endDate) {
      const start = toISODate(form.startDate, form.startTime);
      const end = toISODate(form.endDate, form.endTime);

      if (start && end && new Date(end) < new Date(start)) {
        validationErrors.endDate = "End date must be on or after the start date.";
      }
    }

    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      validationErrors.contactEmail = "Invalid email format.";
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix validation errors before saving.");
      return;
    }

    setLoading(true);

    try {
      const startDate = toISODate(form.startDate, form.startTime);
      const endDate = toISODate(form.endDate, form.endTime);

      if (!startDate || !endDate) {
        toast.error("Please provide valid start and end dates.");
        return;
      }

      const eventData = {
        ...form,
        startDate,
        endDate,
      };

      const url = mode === "edit" && initialData?.id
        ? `/api/events/${initialData.id}`
        : "/api/events";

      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save event");
      }

      toast.success(
        mode === "edit"
          ? "Event updated successfully!"
          : "Event created successfully!"
      );

      router.push("/admin/events");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Unable to save event.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* Basic Info */}
      <FormSection
        title="Basic Information"
        description="Enter the basic details of the event."
      >
        <FormTextField
          label="Title"
          required
          value={form.title}
          error={errors.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Enter event title"
        />

        <FormTextField
          label="Title (Kannada)"
          value={form.titleKn || ""}
          onChange={(e) => updateField("titleKn", e.target.value)}
          placeholder="ಕನ್ನಡ ಶೀರ್ಷಿಕೆ"
        />

        <FormTextArea
          label="Description"
          value={form.description || ""}
          error={errors.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Enter event description"
          rows={4}
        />

        <FormTextArea
          label="Description (Kannada)"
          value={form.descriptionKn || ""}
          onChange={(e) => updateField("descriptionKn", e.target.value)}
          placeholder="ಘಟನೆಯ ವಿವರಣೆ"
          rows={4}
        />

        <FormSelectField
          label="Event Type"
          value={form.type}
          options={eventTypeOptions}
          onChange={(e) => updateField("type", e.target.value as EventType)}
        />
      </FormSection>

      {/* Schedule */}
      <FormSection
        title="Schedule"
        description="Set the date and time for the event."
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormTextField
            label="Start Date"
            required
            type="date"
            value={form.startDate}
            error={errors.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
          />

          <FormTextField
            label="Start Time"
            type="time"
            value={form.startTime || ""}
            onChange={(e) => updateField("startTime", e.target.value)}
          />

          <FormTextField
            label="End Date"
            required
            type="date"
            value={form.endDate}
            error={errors.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
          />

          <FormTextField
            label="End Time"
            type="time"
            value={form.endTime || ""}
            onChange={(e) => updateField("endTime", e.target.value)}
          />
        </div>
      </FormSection>

      {/* Location */}
      <FormSection
        title="Location"
        description="Set the event location."
      >
        <FormTextField
          label="Location"
          value={form.location || ""}
          onChange={(e) => updateField("location", e.target.value)}
          placeholder="Temple Hall, Main Complex"
        />

        <FormSwitchField
          label="Online Event"
          checked={form.isOnline || false}
          onChange={(checked) => updateField("isOnline", checked)}
        />

        {form.isOnline && (
          <FormTextField
            label="Online Link"
            type="url"
            value={form.onlineLink || ""}
            error={errors.onlineLink}
            onChange={(e) => updateField("onlineLink", e.target.value)}
            placeholder="https://zoom.us/j/..."
          />
        )}
      </FormSection>

      {/* Capacity */}
      <FormSection
        title="Capacity"
        description="Set attendance limits (optional)."
      >
        <FormNumberField
          label="Maximum Attendees"
          value={form.maxAttendees}
          onChange={(e) => {
            const val = e.target.value;
            updateField("maxAttendees", val ? parseInt(val, 10) : undefined);
          }}
          placeholder="Leave empty for unlimited"
          min={1}
        />
      </FormSection>

      {/* Organizer */}
      <FormSection
        title="Organizer Contact"
        description="Contact information for the event organizer."
      >
        <FormTextField
          label="Organizer Name"
          value={form.organizer || ""}
          onChange={(e) => updateField("organizer", e.target.value)}
          placeholder="Chief Priest"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormTextField
            label="Contact Phone"
            type="tel"
            value={form.contactPhone || ""}
            onChange={(e) => updateField("contactPhone", e.target.value)}
            placeholder="+91 98765 43210"
          />

          <FormTextField
            label="Contact Email"
            type="email"
            value={form.contactEmail || ""}
            error={errors.contactEmail}
            onChange={(e) => updateField("contactEmail", e.target.value)}
            placeholder="priest@temple.org"
          />
        </div>
      </FormSection>

      {/* Settings */}
      <FormSection
        title="Settings"
        description="Configure event visibility and features."
      >
        <div className="flex flex-col gap-4">
          <FormSwitchField
            label="Featured Event"
            checked={form.featured || false}
            onChange={(checked) => updateField("featured", checked)}
          />

          <FormSwitchField
            label="Published"
            checked={form.published || false}
            onChange={(checked) => updateField("published", checked)}
          />
        </div>
      </FormSection>

      <FormActions
        loading={loading}
        submitLabel={mode === "edit" ? "Update Event" : "Create Event"}
        onCancel={() => router.push("/admin/events")}
      />
    </FormContainer>
  );
}
