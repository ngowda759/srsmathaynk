/**
 * Volunteer Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { Member, MemberRequest, Volunteer, VolunteerRequest } from "@/types/volunteer";

const MEMBERS_COLLECTION = "members";
const VOLUNTEERS_COLLECTION = "volunteers";

export const memberService = {
  async getAllMembers(): Promise<Member[]> {
    console.log("[MemberService] Firebase removed - returning empty array");
    return [];
  },

  async getMemberById(id: string): Promise<Member | null> {
    return null;
  },

  async createMember(data: MemberRequest): Promise<string> {
    throw new Error("Member creation is not available - backend services have been removed");
  },

  async updateMember(id: string, data: Partial<MemberRequest>): Promise<void> {
    throw new Error("Member update is not available - backend services have been removed");
  },

  async deleteMember(id: string): Promise<void> {
    throw new Error("Member deletion is not available - backend services have been removed");
  },
};

export const volunteerService = {
  async getAllVolunteers(): Promise<Volunteer[]> {
    console.log("[VolunteerService] Firebase removed - returning empty array");
    return [];
  },

  async getVolunteerById(id: string): Promise<Volunteer | null> {
    return null;
  },

  async createVolunteer(data: VolunteerRequest): Promise<string> {
    throw new Error("Volunteer creation is not available - backend services have been removed");
  },

  async updateVolunteer(id: string, data: Partial<VolunteerRequest>): Promise<void> {
    throw new Error("Volunteer update is not available - backend services have been removed");
  },

  async deleteVolunteer(id: string): Promise<void> {
    throw new Error("Volunteer deletion is not available - backend services have been removed");
  },
};
