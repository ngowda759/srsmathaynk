import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import KnowledgePageClient from "./KnowledgePageClient";
import { KnowledgeArticleRecord, KnowledgeCategoryRecord, KnowledgeStats } from "@/types/knowledge";

export const dynamic = "force-dynamic";

async function getData() {
  const { knowledgeService } = await import("@/services/knowledge.service");
  const [articlesData, categoriesData, statsData] = await Promise.all([
    knowledgeService.getArticles({}),
    knowledgeService.getCategories(),
    knowledgeService.getStatistics(),
  ]);
  return {
    articles: articlesData.articles,
    categories: categoriesData.categories,
    stats: statsData,
  };
}

export default async function KnowledgeBasePage() {
  const { articles, categories, stats } = await getData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Knowledge Base"
        description="Manage temple knowledge for Raya AI and public reference."
      />
      <KnowledgePageClient
        initialArticles={articles}
        initialCategories={categories}
        initialStats={stats}
      />
    </div>
  );
}
