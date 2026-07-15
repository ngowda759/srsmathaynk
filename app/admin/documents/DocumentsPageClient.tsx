"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, FileText, Download, Search, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import SearchBox from "@/components/admin/common/SearchBox";
import Button from "@/components/ui/button";
import { DocumentRecord, DocumentCategoryRecord, DocumentStats, formatFileSize } from "@/types/document";

export default function DocumentsPageClient({
  initialDocuments,
  initialCategories,
  initialStats,
}: {
  initialDocuments: DocumentRecord[];
  initialCategories: DocumentCategoryRecord[];
  initialStats: DocumentStats;
}) {
  const [documents] = useState<DocumentRecord[]>(initialDocuments);
  const [categories] = useState<DocumentCategoryRecord[]>(initialCategories);
  const [stats] = useState<DocumentStats | null>(initialStats);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  async function handleDelete(document: DocumentRecord) {
    // TODO: Implement delete via API
    alert(`Delete ${document.title} - API not implemented yet`);
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
              <Download className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-stone-500">Total Downloads</p>
              <p className="text-2xl font-bold">{stats?.totalDownloads || 0}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3">
              <FileText className="h-6 w-6 text-purple-600" />
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
          placeholder="Search documents..."
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
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-xl border bg-white">
        <div className="border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold">Documents ({documents.length})</h3>
          <Button asChild>
            <Link href="/admin/documents/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Link>
          </Button>
        </div>
        {documents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-stone-500">No documents found.</p>
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 hover:bg-stone-50">
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-stone-100 p-2">
                    <FileText className="h-5 w-5 text-stone-600" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-stone-500">
                      {doc.titleKn && <span className="mr-2">{doc.titleKn}</span>}
                      {doc.fileName && <span className="mr-2">· {doc.fileName}</span>}
                      {doc.fileSize && <span>· {formatFileSize(doc.fileSize)}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {doc.downloadCount > 0 && (
                    <span className="text-sm text-stone-500">
                      {doc.downloadCount} downloads
                    </span>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/documents/${doc.id}`}>Edit</Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(doc)}>
                    <Trash2 className="h-4 w-4" />
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
