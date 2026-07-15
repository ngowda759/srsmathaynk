"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Users, Calendar, ClipboardCheck, Briefcase } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import Button from "@/components/ui/button";
import { memberService, volunteerService, getVolunteerStatistics } from "@/services/volunteer.service";
import { VolunteerRecord, VolunteerStats } from "@/types/volunteer";

export default function VolunteerManagementPage() {
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [volunteersData, statsData] = await Promise.all([
        volunteerService.getAllVolunteers({ active: true }),
        getVolunteerStatistics(),
      ]);
      setVolunteers(volunteersData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load volunteers:", error);
      toast.error("Failed to load volunteers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(volunteer: VolunteerRecord) {
    if (!window.confirm(`Remove "${volunteer.name}" from volunteers?`)) return;
    try {
      await volunteerService.deleteVolunteer(volunteer.id);
      toast.success("Volunteer removed.");
      await loadData();
    } catch (error) {
      toast.error("Failed to remove volunteer.");
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Volunteer Management"
        description="Manage volunteers, teams, shifts, attendance, and assignments."
        action={
          <Button asChild>
            <Link href="/admin/volunteers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Volunteer
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Volunteers</p>
              <p className="text-2xl font-bold">{stats?.totalVolunteers || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Active</p>
              <p className="text-2xl font-bold">{stats?.activeVolunteers || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Teams</p>
              <p className="text-2xl font-bold">{stats?.totalTeams || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <ClipboardCheck className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Attendance Rate</p>
              <p className="text-2xl font-bold">{stats?.attendanceRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Button variant="outline" asChild className="h-auto flex-col py-6">
          <Link href="/admin/volunteers/teams">
            <Users className="mb-2 h-8 w-8" />
            <span className="font-semibold">Teams</span>
            <span className="text-xs text-stone-500">Manage volunteer teams</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto flex-col py-6">
          <Link href="/admin/volunteers/shifts">
            <Calendar className="mb-2 h-8 w-8" />
            <span className="font-semibold">Shifts</span>
            <span className="text-xs text-stone-500">Schedule volunteer shifts</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto flex-col py-6">
          <Link href="/admin/volunteers/attendance">
            <ClipboardCheck className="mb-2 h-8 w-8" />
            <span className="font-semibold">Attendance</span>
            <span className="text-xs text-stone-500">Track volunteer attendance</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-auto flex-col py-6">
          <Link href="/admin/volunteers/assignments">
            <Briefcase className="mb-2 h-8 w-8" />
            <span className="font-semibold">Assignments</span>
            <span className="text-xs text-stone-500">Assign tasks to volunteers</span>
          </Link>
        </Button>
      </div>

      {/* Volunteers List */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Volunteers</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center">Loading volunteers...</div>
        ) : volunteers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-stone-500">No volunteers found.</p>
            <Button className="mt-4" asChild>
              <Link href="/admin/volunteers/new">
                <Plus className="mr-2 h-4 w-4" />
                Add First Volunteer
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-stone-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {volunteers.slice(0, 10).map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-stone-50">
                    <td className="px-6 py-3 font-mono text-sm">{volunteer.memberId}</td>
                    <td className="px-6 py-3 font-medium">{volunteer.name}</td>
                    <td className="px-6 py-3 text-sm text-stone-600">{volunteer.email}</td>
                    <td className="px-6 py-3 text-sm">{volunteer.phone || "-"}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${volunteer.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {volunteer.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/volunteers/${volunteer.id}`}>View</Link>
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(volunteer)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
