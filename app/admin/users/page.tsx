import Link from "next/link";

import { Button } from "@/components/ui/button";

import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import UserStats from "@/components/admin/users/UserStats";
import UserTable from "@/components/admin/users/UserTable";
import AdminAuthGuard from "@/components/admin/layout/AdminAuthGuard";
import UsersPageClient from "./UsersPageClient";

import { TempleUser } from "@/types/user";

export const dynamic = "force-dynamic";

async function getUsers(): Promise<TempleUser[]> {
  const { userService } = await import("@/services/user.service");
  return userService.getUsers();
}

interface UsersPageProps {
  searchParams: Promise<{ search?: string }>;
}

async function UsersPageContent({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const users = await getUsers();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Temple Users"
        description="Manage temple staff and administrator accounts."
        action={
          <Link href="/admin/users/new">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Add User
            </Button>
          </Link>
        }
      />

      <UserStats
        total={users.length}
        active={users.filter((u) => u.active).length}
        admins={
          users.filter(
            (u) =>
              u.role === "ADMIN" ||
              u.role === "SUPER_ADMIN"
          ).length
        }
        volunteers={
          users.filter((u) => u.role === "VOLUNTEER").length
        }
      />

      <UsersPageClient users={users} />
    </div>
  );
}

export default function UsersPage() {
  return (
    <AdminAuthGuard requiredPermission="users">
      <UsersPageContent searchParams={Promise.resolve({})} />
    </AdminAuthGuard>
  );
}
