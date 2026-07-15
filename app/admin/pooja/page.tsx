import Link from "next/link";
import PoojaTable from "@/components/admin/pooja/PoojaTable";
import PoojaStats from "@/components/admin/pooja/PoojaStats";
import PoojaPageClient from "./PoojaPageClient";
import { Button } from "@/components/ui/button";
import { DailyPooja } from "@/types/pooja";

export const dynamic = "force-dynamic";

async function getPoojas(): Promise<DailyPooja[]> {
  const { poojaService } = await import("@/services/pooja.service");
  return poojaService.getPoojas();
}

interface PoojaPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function PoojaPage({ searchParams }: PoojaPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const poojas = await getPoojas();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Daily Pooja Management</h1>
          <p className="text-sm text-muted-foreground">Manage temple daily pooja schedule, timings, and seva amounts.</p>
        </div>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href="/admin/pooja/create">Add Pooja</Link>
        </Button>
      </div>
      <PoojaStats />
      <PoojaPageClient poojas={filteredPoojas} />
    </div>
  );
}
