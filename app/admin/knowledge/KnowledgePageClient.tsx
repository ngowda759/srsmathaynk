"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Eye, Tag, Folder } from "lucide-react";
import toast from "react-hot-toast";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { KnowledgeArticleRecord, KnowledgeCategoryRecord, KnowledgeStats } from "@/types/knowledge";

export default function KnowledgePageClient({
  initialArticles,
  initialCategories,
  initialStats,
}: {
  initialArticles: KnowledgeArticleRecord[];
  initialCategories: KnowledgeCategoryRecord[];
  initialStats: KnowledgeStats;
}) {
  const [articles] = useState<KnowledgeArticleRecord[]>(initialArticles);
  const [categories] = useState<KnowledgeCategoryRecord[]>(initialCategories);
  const [stats] = useState<KnowledgeStats | null>(initialStats);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  async function handleDelete(article: KnowledgeArticleRecord) {
    // TODO: Implement delete via API
    alert(`Delete ${article.title} - API not implemented yet`);
  }

  async function togglePublished(article: KnowledgeArticleRecord) {
    // TODO: Implement toggle via API
    alert(`Toggle published ${article.title} - API not implemented yet`);
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <Eye className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Published</p>
              <p className="text-2xl font-bold">{stats?.publishedArticles || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <Folder className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Categories</p>
              <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search articles..."
        />
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === "all" ? "primary" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "primary" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
            >
              <Tag className="mr-1 h-4 w-4" />
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Articles List */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Articles ({articles.length})</h3>
          <Button asChild>
            <Link href="/admin/knowledge/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Article
            </Link>
          </Button>
        </div>
        {articles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-stone-500">No articles found.</p>
          </div>
        ) : (
          <div className="divide-y">
            {articles.map((article) => (
              <div key={article.id} className="flex items-center justify-between p-4 hover:bg-stone-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-stone-100 p-2">
                    <BookOpen className="h-5 w-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-stone-500">
                      {article.titleKn && <span className="mr-2">{article.titleKn}</span>}
                      {article.categoryName && (
                        <span className="mr-2">
                          · <Tag className="inline h-3 w-3 mr-1" />
                          {article.categoryName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    article.published
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {article.published ? "Published" : "Draft"}
                  </span>
                  <Button size="sm" variant="outline" onClick={() => togglePublished(article)}>
                    {article.published ? "Unpublish" : "Publish"}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/knowledge/${article.id}`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(article)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
