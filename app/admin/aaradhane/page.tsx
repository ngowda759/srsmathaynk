import Link from "next/link";

import { Button } from "@/components/ui/button";

import AaradhaneTable from "@/components/admin/aaradhane/AaradhaneTable";
import AaradhaneStats from "@/components/admin/aaradhane/AaradhaneStats";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import AaradhanePageClient from "./AaradhanePageClient";

import { Aaradhane } from "@/types/aaradhane";

export const dynamic = "force-dynamic";

async function getAaradhanes(): Promise<Aaradhane[]> {
  const { aaradhaneService } = await import("@/services/aaradhane.service");
  return aaradhaneService.getAaradhanes();
}

interface AaradhanePageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AaradhanePage({ searchParams }: AaradhanePageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const items = await getAaradhanes();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Aaradhane Management"
        description="Manage temple aaradhane events, rituals, and offerings."
        action={
          <Button asChild>
            <Link href="/admin/aaradhane/create">Add Aaradhane</Link>
          </Button>
        }
      />

      <AaradhaneStats />
      <AaradhanePageClient items={items} />
    </div>
  );
}
