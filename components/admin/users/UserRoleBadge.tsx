import { UserRole } from "@/types/user";

interface Props {
  role: UserRole;
}

const roleDisplayNames: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  PRIEST: "Priest",
  STAFF: "Staff",
  VOLUNTEER: "Volunteer",
  DEVOTEE: "Devotee",
};

const colors: Record<UserRole, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-700",
  ADMIN: "bg-orange-100 text-orange-700",
  PRIEST: "bg-blue-100 text-blue-700",
  STAFF: "bg-green-100 text-green-700",
  VOLUNTEER: "bg-purple-100 text-purple-700",
  DEVOTEE: "bg-slate-100 text-slate-700",
};

export default function UserRoleBadge({ role }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colors[role]}`}
    >
      {roleDisplayNames[role] || role}
    </span>
  );
}
