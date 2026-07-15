import SevasPageClient from "./SevasPageClient";
import { SevaRecord, SevaStats } from "@/types/seva";

export const dynamic = "force-dynamic";

async function getSevas() {
  const { sevaService } = await import("@/services/seva.service");
  const [sevasResult, stats] = await Promise.all([
    sevaService.getSevas({}),
    sevaService.getStatistics(),
  ]);

  return { sevas: sevasResult.sevas, stats };
}

export default async function SevasPage() {
  const { sevas, stats } = await getSevas();

  return <SevasPageClient sevas={sevas} stats={stats} />;
}
