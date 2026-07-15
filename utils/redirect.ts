import { UserProfile } from "@/types/user";

export function getDashboardRoute(profile: UserProfile | null) {
  if (!profile) return "/";

  switch (profile.role) {
    case "SUPER_ADMIN":
      return "/admin";

    case "ADMIN":
      return "/admin";

    case "PRIEST":
      return "/priest";

    case "STAFF":
      return "/staff";

    case "VOLUNTEER":
      return "/volunteer";

    case "DEVOTEE":
      return "/devotee";

    default:
      return "/";
  }
}
