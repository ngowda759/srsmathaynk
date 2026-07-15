"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Breadcrumb from "@/components/calendar/Breadcrumb";
import { ChevronLeft, ChevronRight, X, ArrowLeft } from "lucide-react";

type GalleryItem = {
  id: string;
  type: "PHOTO" | "VIDEO";
  media?: { url: string };
  title?: string;
  caption?: string;
  altText?: string;
};

type GalleryAlbum = {
  id: string;
  title: string;
  titleKn?: string;
  description?: string;
  descriptionKn?: string;
  coverImage?: { url: string };
  category?: { name: string };
  photoCount: number;
  videoCount: number;
  eventDate?: string;
  location?: string;
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function AlbumDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  
  const [album, setAlbum] = useState<GalleryAlbum | null>(null);
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    async function loadAlbum() {
      try {
        // Fetch album by slug
        const response = await fetch(`/api/gallery/albums?slug=${slug}&published=true`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
          const albumData = data.data[0];
          setAlbum(albumData);
          
          // Fetch items for this album
          const itemsResponse = await fetch(`/api/gallery/albums/${albumData.id}/items`);
          const itemsData = await itemsResponse.json();
          
          if (itemsData.success) {
            setItems(itemsData.data);
          }
        } else {
          // Album not found
          router.push("/gallery");
        }
      } catch (err) {
        console.error("Failed to load album:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAlbum();
  }, [slug, router]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % items.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
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

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-120px)] flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 mx-auto rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
            <p className="mt-4 text-muted-foreground">Loading album...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!album) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-120px)] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Album Not Found</h1>
            <Link href="/gallery" className="text-orange-500 hover:text-orange-600">
              Return to Gallery
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-120px)] bg-white px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <Breadcrumb items={[{ label: "Gallery", href: "/gallery" }]} current={album.title} />
        </div>

        {/* Album Header */}
        <div className="mx-auto max-w-7xl mt-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/gallery"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Gallery
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cover Image */}
            <div className="lg:col-span-1">
              <div className="aspect-square rounded-3xl overflow-hidden border border-stone-200 bg-stone-100">
                {album.coverImage?.url ? (
                  <Image
                    src={album.coverImage.url}
                    alt={album.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl">
                    📷
                  </div>
                )}
              </div>
            </div>

            {/* Album Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-stone-900">{album.title}</h1>
                {album.titleKn && (
                  <p className="text-xl text-stone-500 mt-1">{album.titleKn}</p>
                )}
              </div>

              {album.category && (
                <span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700">
                  {album.category.name}
                </span>
              )}

              {album.description && (
                <p className="text-lg text-stone-600 leading-relaxed">
                  {album.description}
                </p>
              )}

              <div className="flex flex-wrap gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📷</span>
                  <span>{album.photoCount} photos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  <span>{album.videoCount} videos</span>
                </div>
                {album.eventDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <span>{new Date(album.eventDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}</span>
                  </div>
                )}
                {album.location && (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <span>{album.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="mx-auto max-w-7xl mt-12">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-12 text-center text-stone-700">
              <p className="text-lg">No photos in this album yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  {item.media?.url ? (
                    <Image
                      src={item.media.url}
                      alt={item.altText || item.title || "Gallery image"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">
                      {item.type === "VIDEO" ? "🎬" : "📷"}
                    </div>
                  )}
                  
                  {item.type === "VIDEO" && (
                    <div className="absolute top-3 right-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                      VIDEO
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.title && (
                      <p className="font-medium truncate">{item.title}</p>
                    )}
                    {item.caption && (
                      <p className="text-sm opacity-80 truncate">{item.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && items[lightboxIndex] && (
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
            {items[lightboxIndex].media?.url ? (
              items[lightboxIndex].type === "PHOTO" ? (
                <Image
                  src={items[lightboxIndex].media.url}
                  alt={items[lightboxIndex].altText || items[lightboxIndex].title || ""}
                  width={1200}
                  height={800}
                  className="max-h-[85vh] w-auto object-contain"
                />
              ) : (
                <video
                  src={items[lightboxIndex].media.url}
                  controls
                  autoPlay
                  className="max-h-[85vh] w-auto"
                />
              )
            ) : (
              <div className="flex items-center justify-center h-[60vh] text-6xl">
                {items[lightboxIndex].type === "VIDEO" ? "🎬" : "📷"}
              </div>
            )}
            <div className="mt-4 text-center text-white">
              {items[lightboxIndex].title && (
                <h3 className="text-xl font-semibold">{items[lightboxIndex].title}</h3>
              )}
              {items[lightboxIndex].caption && (
                <p className="mt-1 text-gray-400">{items[lightboxIndex].caption}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {lightboxIndex + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
