"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBox from "@/components/admin/common/SearchBox";
import UserTable from "@/components/admin/users/UserTable";
import { TempleUser } from "@/types/user";

interface UsersPageClientProps {
  users: TempleUser[];
}

export default function UsersPageClient({ users: initialUsers }: UsersPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users] = useState(initialUsers);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/users?${params.toString()}`);
  };

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      const name = user.name ?? "";
      const email = user.email ?? "";
      const role = user.role ?? "";

      return (
        name.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        role.toLowerCase().includes(keyword)
      );
    });
  }, [users, search]);

  return (
    <>
      <SearchBox
        value={search}
        onChange={handleSearchChange}
        placeholder="Search users..."
      />
      <UserTable users={filteredUsers} />
    </>
  );
}
