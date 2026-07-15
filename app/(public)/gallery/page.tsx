"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/calendar/Breadcrumb";
import SectionHeading from "@/components/common/SectionHeading";
import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  src: string;
  alt: string;
  title: string;
  year?: string;
};

type GalleryAlbum = {
  id: string;
  title: string;
  slug: string;
  coverImage?: { url: string };
  photoCount: number;
  videoCount: number;
  category?: { name: string };
};

type GalleryFilter = "all" | "photos" | "videos";

export default function GalleryPage() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<GalleryFilter>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"albums" | "all">("albums");

  // Get unique years from items
  const years = [...new Set(items.map((item) => item.year).filter(Boolean))].sort().reverse();

  const filteredItems = items.filter((item) => {
    if (filter === "photos" && item.type !== "PHOTO") return false;
    if (filter === "videos" && item.type !== "VIDEO") return false;
    if (selectedYear !== "all" && item.year !== selectedYear) return false;
    return true;
  });

  useEffect(() => {
    async function loadGallery() {
      try {
        const response = await fetch("/api/gallery/albums?published=true&limit=50");
        const data = await response.json();
        if (data.success) {
          setAlbums(data.data);
        }
      } catch (err) {
        console.error("Failed to load gallery:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
  }, []);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % filteredItems.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-120px)] bg-white px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb current="Gallery" />
        </div>

        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-center">
              <div className="h-12 w-12 mx-auto rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading gallery...</p>
            </div>
          </div>
        ) : albums.length === 0 ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-12 text-center text-stone-700 shadow-sm">
              <p className="text-lg">No gallery albums available yet.</p>
              <p className="mt-2 text-sm">Check back soon for photos and videos from our temple events.</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl space-y-12">
            <SectionHeading
              title="Temple Gallery"
              subtitle="A visual journey through the spiritual life and ceremonies at our temple."
            />

            {/* View Mode Toggle */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setViewMode("albums")}
                className={`rounded-2xl border-2 px-6 py-3 font-semibold transition ${
                  viewMode === "albums"
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-stone-200 text-stone-600 hover:border-amber-300"
                }`}
              >
                Albums
              </button>
              <button
                onClick={() => setViewMode("all")}
                className={`rounded-2xl border-2 px-6 py-3 font-semibold transition ${
                  viewMode === "all"
                    ? "border-amber-400 bg-amber-50 text-amber-700"
                    : "border-stone-200 text-stone-600 hover:border-amber-300"
                }`}
              >
                All Photos
              </button>
            </div>

            {/* Albums View */}
            {viewMode === "albums" && (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((album) => (
                  <Link
                    key={album.id}
                    href={`/gallery/album/${album.slug}`}
                    className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition hover:shadow-lg"
                  >
                    <div className="relative aspect-video bg-stone-100">
                      {album.coverImage?.url ? (
                        <Image
                          src={album.coverImage.url}
                          alt={album.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          📷
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold">{album.title}</h3>
                        <div className="mt-1 flex gap-3 text-sm opacity-90">
                          <span>📷 {album.photoCount}</span>
                          <span>🎬 {album.videoCount}</span>
                        </div>
                      </div>
                    </div>
                    {album.category && (
                      <div className="p-4">
                        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                          {album.category.name}
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* All Items View */}
            {viewMode === "all" && (
              <>
                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-4">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as GalleryFilter)}
                    className="appearance-none rounded-2xl border-2 border-amber-300 bg-white px-6 py-3 pr-10 font-semibold text-stone-700 shadow-sm transition hover:border-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
                  >
                    <option value="all">All Media</option>
                    <option value="photos">Photos</option>
                    <option value="videos">Videos</option>
                  </select>

                  {years.length > 0 && (
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="appearance-none rounded-2xl border-2 border-amber-300 bg-white px-6 py-3 pr-10 font-semibold text-stone-700 shadow-sm transition hover:border-amber-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 cursor-pointer"
                    >
                      <option value="all">All Years</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Grid */}
                {filteredItems.length === 0 ? (
                  <div className="rounded-3xl border border-stone-200 bg-stone-50 p-12 text-center text-stone-700">
                    No items found.
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm cursor-pointer"
                        onClick={() => openLightbox(index)}
                      >
                        <div className="relative h-72 w-full bg-black">
                          {item.type === "PHOTO" ? (
                            <Image
                              src={item.src}
                              alt={item.alt}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              className="object-cover transition duration-500 hover:scale-105"
                            />
                          ) : (
                            <video
                              src={item.src}
                              className="h-full w-full object-cover"
                              muted
                            />
                          )}
                          {item.type === "VIDEO" && (
                            <div className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                              VIDEO
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-stone-900 truncate">
                              {item.title}
                            </h3>
                            {item.year && (
                              <span className="text-sm font-medium text-amber-600">
                                {item.year}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-stone-600 line-clamp-2">
                            {item.alt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {lightboxOpen && filteredItems[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="h-8 w-8" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="h-12 w-12" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="h-12 w-12" />
          </button>

          <div className="max-w-6xl max-h-[90vh] px-4">
            {filteredItems[lightboxIndex].type === "PHOTO" ? (
              <Image
                src={filteredItems[lightboxIndex].src}
                alt={filteredItems[lightboxIndex].alt}
                width={1200}
                height={800}
                className="max-h-[85vh] w-auto object-contain"
              />
            ) : (
              <video
                src={filteredItems[lightboxIndex].src}
                controls
                autoPlay
                className="max-h-[85vh] w-auto"
              />
            )}
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold">{filteredItems[lightboxIndex].title}</h3>
              <p className="mt-1 text-gray-400">{filteredItems[lightboxIndex].alt}</p>
              <p className="mt-2 text-sm text-gray-500">
                {lightboxIndex + 1} / {filteredItems.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
