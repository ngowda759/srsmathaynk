"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AaradhaneTable from "@/components/admin/aaradhane/AaradhaneTable";
import SearchBox from "@/components/admin/common/SearchBox";
import { Aaradhane } from "@/types/aaradhane";

interface AaradhanePageClientProps {
  items: Aaradhane[];
}

export default function AaradhanePageClient({ items: initialItems }: AaradhanePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [items] = useState(initialItems);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/aaradhane?${params.toString()}`);
  };

  const filteredItems = items.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(keyword) ||
      item.guruName.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.significance.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <SearchBox
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, guru, or significance..."
        />
      </div>
      <AaradhaneTable items={filteredItems} onRefresh={() => router.refresh()} />
    </>
  );
}
