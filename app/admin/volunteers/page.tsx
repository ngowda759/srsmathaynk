import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import VolunteersPageClient from "./VolunteersPageClient";
import { VolunteerRecord, VolunteerStats } from "@/types/volunteer";

export const dynamic = "force-dynamic";

async function getVolunteers(): Promise<{ volunteers: VolunteerRecord[]; stats: VolunteerStats }> {
  const { volunteerService, getVolunteerStatistics } = await import("@/services/volunteer.service");
  const [volunteers, stats] = await Promise.all([
    volunteerService.getAllVolunteers({}),
    getVolunteerStatistics(),
  ]);
  return { volunteers, stats };
}

export default async function VolunteerManagementPage() {
  const { volunteers, stats } = await getVolunteers();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Volunteer Management"
        description="Manage volunteers, teams, shifts, attendance, and assignments."
      />
      <VolunteersPageClient stats={stats} initialVolunteers={volunteers} />
    </div>
  );
}
