import type {
  Profile,
  Role,
  UserRole,
} from "@prisma/client";

export type { Profile, Role, UserRole };

// Volunteer record
export interface VolunteerRecord {
  id: string;
  memberId: string;
  name: string;
  email: string;
  phone: string | null;
  sex: "Male" | "Female" | "Other";
  active: boolean;
  address: string | null;
  skills: string[];
  availability: string;
  joinedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Team record
export interface TeamRecord {
  id: string;
  name: string;
  description: string | null;
  leaderId: string | null;
  memberCount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Shift record
export interface ShiftRecord {
  id: string;
  name: string;
  teamId: string | null;
  date: Date;
  startTime: string;
  endTime: string;
  location: string | null;
  requiredVolunteers: number;
  registeredVolunteers: number;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Attendance record
export interface AttendanceRecord {
  id: string;
  shiftId: string;
  volunteerId: string;
  volunteerName: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Assignment record
export interface AssignmentRecord {
  id: string;
  volunteerId: string;
  volunteerName: string;
  shiftId: string | null;
  shiftName: string | null;
  task: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Statistics
export interface VolunteerStats {
  totalVolunteers: number;
  activeVolunteers: number;
  totalTeams: number;
  activeShifts: number;
  totalAttendances: number;
  attendanceRate: number;
}

// Volunteer request
export interface VolunteerRequest {
  memberId?: string;
  name: string;
  email: string;
  phone?: string;
  sex: "Male" | "Female" | "Other";
  active?: boolean;
  address?: string;
  skills?: string[];
  availability?: string;
}

// Team request
export interface TeamRequest {
  name: string;
  description?: string;
  leaderId?: string;
  active?: boolean;
}

// Shift request
export interface ShiftRequest {
  name: string;
  teamId?: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  requiredVolunteers?: number;
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

// Attendance request
export interface AttendanceRequest {
  shiftId: string;
  volunteerId: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  remarks?: string;
}

// Assignment request
export interface AssignmentRequest {
  volunteerId: string;
  shiftId?: string;
  task: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  dueDate?: Date;
}

// Options
export const sexOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
];

export const attendanceStatusOptions = [
  { label: "Present", value: "PRESENT", color: "bg-green-100 text-green-800" },
  { label: "Absent", value: "ABSENT", color: "bg-red-100 text-red-800" },
  { label: "Late", value: "LATE", color: "bg-amber-100 text-amber-800" },
  { label: "Excused", value: "EXCUSED", color: "bg-blue-100 text-blue-800" },
];

export const shiftStatusOptions = [
  { label: "Scheduled", value: "SCHEDULED", color: "bg-blue-100 text-blue-800" },
  { label: "In Progress", value: "IN_PROGRESS", color: "bg-amber-100 text-amber-800" },
  { label: "Completed", value: "COMPLETED", color: "bg-green-100 text-green-800" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-gray-100 text-gray-800" },
];

export const assignmentStatusOptions = [
  { label: "Pending", value: "PENDING", color: "bg-yellow-100 text-yellow-800" },
  { label: "In Progress", value: "IN_PROGRESS", color: "bg-blue-100 text-blue-800" },
  { label: "Completed", value: "COMPLETED", color: "bg-green-100 text-green-800" },
  { label: "Cancelled", value: "CANCELLED", color: "bg-gray-100 text-gray-800" },
];
