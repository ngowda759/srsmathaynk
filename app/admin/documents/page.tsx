"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, FileText, Download, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AdminPageHeader from "@/components/admin/common/AdminPageHeader";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { documentService } from "@/services/document.service";
import { DocumentRecord, DocumentCategoryRecord, DocumentStats, formatFileSize } from "@/types/document";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [categories, setCategories] = useState<DocumentCategoryRecord[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [documentsData, categoriesData, statsData] = await Promise.all([
        documentService.getDocuments({ 
          ...(selectedCategory !== "all" && { categoryId: selectedCategory }),
          search: search || undefined 
        }),
        documentService.getCategories(),
        documentService.getStatistics(),
      ]);
      setDocuments(documentsData.documents);
      setCategories(categoriesData.categories);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load documents:", error);
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(document: DocumentRecord) {
    if (!window.confirm(`Delete "${document.title}"?`)) return;
    try {
      await documentService.deleteDocument(document.id);
      toast.success("Document deleted.");
      await loadData();
    } catch (error) {
      toast.error("Failed to delete document.");
    }
  }

  async function toggleFeatured(document: DocumentRecord) {
    try {
      await documentService.toggleFeatured(document.id);
      toast.success(`Document ${document.featured ? "unfeatured" : "featured"}.`);
      await loadData();
    } catch (error) {
      toast.error("Failed to update.");
    }
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Documents"
        description="Manage circulars, notices, PDFs, and downloads."
        action={
          <Button asChild>
            <Link href="/admin/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              Upload Document
            </Link>
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Documents</p>
              <p className="text-2xl font-bold">{stats?.totalDocuments || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Categories</p>
              <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-amber-100 p-3">
              <Download className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Downloads</p>
              <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.name} ({category.documentCount || 0})
          </Button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="Search documents..."
          />
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/documents/categories">
            Manage Categories
          </Link>
        </Button>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-xl border bg-white p-8 text-center">
          <FileText className="mx-auto h-12 w-12 text-stone-300" />
          <p className="mt-4 text-stone-500">No documents found.</p>
          <Button className="mt-4" asChild>
            <Link href="/admin/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              Upload First Document
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((document) => (
            <div
              key={document.id}
              className="rounded-xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{document.title}</h3>
                    {document.featured && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                        Featured
                      </span>
                    )}
                  </div>
                  {document.category && (
                    <span className="mt-1 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                      {document.category.name}
                    </span>
                  )}
                </div>
              </div>

              {document.description && (
                <p className="mb-4 text-sm text-stone-600 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="flex items-center justify-between border-t pt-4 text-sm text-stone-500">
                <div className="flex items-center gap-4">
                  {document.fileSize && (
                    <span>{formatFileSize(document.fileSize)}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {document.downloadCount}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleFeatured(document)}
                >
                  {document.featured ? "Unfeature" : "Feature"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(document)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
