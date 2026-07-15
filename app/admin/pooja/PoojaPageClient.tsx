"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PoojaTable from "@/components/admin/pooja/PoojaTable";
import SearchBox from "@/components/admin/common/SearchBox";
import { DailyPooja } from "@/types/pooja";

interface PoojaPageClientProps {
  poojas: DailyPooja[];
}

export default function PoojaPageClient({ poojas: initialPoojas }: PoojaPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [poojas] = useState(initialPoojas);
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`/admin/pooja?${params.toString()}`);
  };

  const filteredPoojas = poojas.filter((pooja) => {
    const keyword = search.toLowerCase();
    return (
      pooja.title.toLowerCase().includes(keyword) ||
      pooja.description.toLowerCase().includes(keyword) ||
      pooja.category.toLowerCase().includes(keyword) ||
      pooja.notes.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <SearchBox
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title, category, or notes..."
        />
      </div>
      <PoojaTable poojas={filteredPoojas} onRefresh={() => router.refresh()} />
    </>
  );
}
