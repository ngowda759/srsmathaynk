import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import DocumentsPageClient from "./DocumentsPageClient";
import { DocumentRecord, DocumentCategoryRecord, DocumentStats } from "@/types/document";

export const dynamic = "force-dynamic";

async function getData() {
  const { documentService } = await import("@/services/document.service");
  const [documentsData, categoriesData, statsData] = await Promise.all([
    documentService.getDocuments({}),
    documentService.getCategories(),
    documentService.getStatistics(),
  ]);
  return {
    documents: documentsData.documents,
    categories: categoriesData.categories,
    stats: statsData,
  };
}

export default async function DocumentsPage() {
  const { documents, categories, stats } = await getData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Documents"
        description="Manage circulars, PDFs, notices, and downloads."
      />
      <DocumentsPageClient
        initialDocuments={documents}
        initialCategories={categories}
        initialStats={stats}
      />
    </div>
  );
}
