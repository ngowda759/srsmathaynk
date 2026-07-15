import { CrudColumn } from "@/types/crud";
import { TempleEvent, EVENT_TYPE_LABELS, EVENT_STATUS_LABELS } from "@/types/event";

export const eventColumns: CrudColumn<TempleEvent>[] = [
  {
    key: "title",
    header: "Title",
    sortable: true,
  },
  {
    key: "type",
    header: "Type",
    formatter: (value) => EVENT_TYPE_LABELS[value as keyof typeof EVENT_TYPE_LABELS] || value,
  },
  {
    key: "startDate",
    header: "Start Date",
    sortable: true,
    formatter: (value) => {
      if (!value) return "-";
      const date = new Date(value);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
  {
    key: "status",
    header: "Status",
    formatter: (value) => {
      const status = EVENT_STATUS_LABELS[value as keyof typeof EVENT_STATUS_LABELS] || value;
      const colors: Record<string, string> = {
        UPCOMING: "text-blue-600 bg-blue-50",
        ONGOING: "text-green-600 bg-green-50",
        COMPLETED: "text-gray-600 bg-gray-50",
        CANCELLED: "text-red-600 bg-red-50",
      };
      return `<span class="px-2 py-1 rounded-full text-xs font-medium ${colors[value as string] || ""}">${status}</span>`;
    },
  },
  {
    key: "featured",
    header: "Featured",
    formatter: (value) => (value ? "⭐" : ""),
  },
  {
    key: "published",
    header: "Published",
    formatter: (value) => (value ? "✅" : "❌"),
  },
  {
    key: "actions",
    header: "Actions",
    type: "actions",
  },
];
