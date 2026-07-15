"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, BookOpen, Eye, Tag, Folder } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { knowledgeService } from "@/services/knowledge.service";
import { KnowledgeArticleRecord, KnowledgeCategoryRecord, KnowledgeStats } from "@/types/knowledge";

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<KnowledgeArticleRecord[]>([]);
  const [categories, setCategories] = useState<KnowledgeCategoryRecord[]>([]);
  const [stats, setStats] = useState<KnowledgeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [articlesData, categoriesData, statsData] = await Promise.all([
        knowledgeService.getArticles({
          ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
          ...(search && { search }),
        }),
        knowledgeService.getCategories(),
        knowledgeService.getStatistics(),
      ]);
      setArticles(articlesData.articles);
      setCategories(categoriesData.categories);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load knowledge base:", error);
      toast.error("Failed to load knowledge base.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(article: KnowledgeArticleRecord) {
    if (!window.confirm(`Delete "${article.title}"?`)) return;
    try {
      await fetch(`/api/knowledge/${article.id}`, { method: "DELETE" });
      toast.success("Article deleted.");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete article.");
    }
  }

  async function togglePublished(article: KnowledgeArticleRecord) {
    try {
      await fetch(`/api/knowledge/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !article.published }),
      });
      toast.success(`Article ${article.published ? "unpublished" : "published"}.`);
      await loadData();
    } catch (error) {
      toast.error("Failed to update.");
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Temple Knowledge Base"
        description="Foundation for Raya AI - Store structured knowledge about the temple."
        action={
          <Button asChild>
            <Link href="/admin/knowledge/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Articles</p>
              <p className="text-2xl font-bold">{stats?.totalArticles || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Published</p>
              <p className="text-2xl font-bold">{stats?.publishedArticles || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <Folder className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Categories</p>
              <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Views</p>
              <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "primary" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "primary" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.articleCount || 0})
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search knowledge base..."
          />
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/knowledge/categories">
            Manage Categories
          </Link>
        </Button>
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading articles...
        </div>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-500">No articles found.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/knowledge/new">
              <Plus className="mr-2 h-4 w-4" />
              Add First Article
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="rounded-xl border bg-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{article.title}</h3>
                    {article.featured && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                        Featured
                      </span>
                    )}
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      article.published ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  {article.category && (
                    <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                      {article.category.name}
                    </span>
                  )}
                  {article.excerpt && (
                    <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.viewCount} views
                    </span>
                    {article.tags && article.tags.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {article.tags.map((t) => t.name).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublished(article)}
                  >
                    {article.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    asChild
                  >
                    <Link href={`/admin/knowledge/${article.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(article)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
