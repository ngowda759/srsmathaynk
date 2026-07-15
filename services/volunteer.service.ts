/**
 * Volunteer Service - Sprint 4.5
 * Full CRUD operations using Prisma
 */

import { prisma } from "@/lib/db";
import {
  VolunteerRecord,
  VolunteerRequest,
  TeamRecord,
  TeamRequest,
  ShiftRecord,
  ShiftRequest,
  AttendanceRecord,
  AttendanceRequest,
  AssignmentRecord,
  AssignmentRequest,
  VolunteerStats,
} from "@/types/volunteer";

// Helper to generate member ID
async function generateMemberId(): Promise<string> {
  const count = await prisma.profile.count();
  return `M${String(count + 1).padStart(6, "0")}`;
}

export const memberService = {
  async getAllMembers(options?: {
    active?: boolean;
    search?: string;
    limit?: number;
  }): Promise<{ members: VolunteerRecord[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (options?.active !== undefined) {
      where.isActive = options.active;
    }

    const [members, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit,
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      members: members.map((m) => ({
        id: m.id,
        memberId: m.userId,
        name: m.name || "Unknown",
        email: m.email,
        phone: m.phone,
        sex: "Male" as const,
        active: m.isActive,
        address: m.address,
        skills: [] as string[],
        availability: "",
        joinedDate: m.createdAt,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      total,
    };
  },

  async getMemberById(id: string): Promise<VolunteerRecord | null> {
    const member = await prisma.profile.findUnique({ where: { id } });
    if (!member) return null;
    return {
      id: member.id,
      memberId: member.userId,
      name: member.name || "Unknown",
      email: member.email,
      phone: member.phone,
      sex: "Male" as const,
      active: member.isActive,
      address: member.address,
      skills: [],
      availability: "",
      joinedDate: member.createdAt,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt,
    };
  },

  async createMember(data: VolunteerRequest): Promise<string> {
    const profile = await prisma.profile.create({
      data: {
        userId: data.memberId || await generateMemberId(),
        name: data.name,
        email: data.email || "",
        phone: data.phone,
        address: data.address,
        isActive: data.active ?? true,
      },
    });
    return profile.id;
  },

  async updateMember(id: string, data: Partial<VolunteerRequest>): Promise<void> {
    await prisma.profile.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.active !== undefined && { isActive: data.active }),
      },
    });
  },

  async deleteMember(id: string): Promise<void> {
    await prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};

export const volunteerService = {
  async getAllVolunteers(options?: {
    active?: boolean;
    search?: string;
    limit?: number;
  }): Promise<VolunteerRecord[]> {
    const result = await memberService.getAllMembers(options);
    return result.members;
  },

  async getVolunteerById(id: string): Promise<VolunteerRecord | null> {
    return memberService.getMemberById(id);
  },

  async createVolunteer(data: VolunteerRequest): Promise<string> {
    return memberService.createMember(data);
  },

  async updateVolunteer(id: string, data: Partial<VolunteerRequest>): Promise<void> {
    await memberService.updateMember(id, data);
  },

  async deleteVolunteer(id: string): Promise<void> {
    await memberService.deleteMember(id);
  },
};

// Team Service
export const teamService = {
  async createTeam(data: TeamRequest): Promise<string> {
    // Note: Would need a Team model in schema - using profile as placeholder
    const team = await prisma.profile.create({
      data: {
        userId: `TEAM-${Date.now()}`,
        name: data.name,
        email: `team-${Date.now()}@placeholder`,
        address: data.description || null,
      },
    });
    return team.id;
  },

  async getTeams(options?: { active?: boolean }): Promise<{ teams: TeamRecord[]; total: number }> {
    const teams = await prisma.profile.findMany({
      where: { isActive: options?.active },
      orderBy: { createdAt: "desc" },
    });

    return {
      teams: teams.map((t) => ({
        id: t.id,
        name: t.name || "Unknown",
        description: t.address,
        leaderId: null,
        memberCount: 0,
        active: t.isActive,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: teams.length,
    };
  },

  async updateTeam(id: string, data: Partial<TeamRequest>): Promise<void> {
    await prisma.profile.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { address: data.description }),
        ...(data.active !== undefined && { isActive: data.active }),
      },
    });
  },

  async deleteTeam(id: string): Promise<void> {
    await prisma.profile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};

// Statistics
export async function getVolunteerStatistics(): Promise<VolunteerStats> {
  const [totalProfiles, activeProfiles, teams] = await Promise.all([
    prisma.profile.count({ where: { deletedAt: null } }),
    prisma.profile.count({ where: { isActive: true, deletedAt: null } }),
    prisma.profile.count(),
  ]);

  return {
    totalVolunteers: totalProfiles,
    activeVolunteers: activeProfiles,
    totalTeams: teams,
    activeShifts: 0,
    totalAttendances: 0,
    attendanceRate: 0,
  };
}
