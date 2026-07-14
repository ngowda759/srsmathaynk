/**
 * Gallery Service - Firebase has been removed
 * This service now returns empty arrays as no backend is available
 */

import { GalleryAlbum, GalleryMedia, GalleryMediaRequest } from "@/types/gallery";

const ALBUM_COLLECTION = "galleryAlbums";
const MEDIA_COLLECTION = "galleryMedia";

export const galleryService = {
  async getAlbums(): Promise<GalleryAlbum[]> {
    console.log("[GalleryService] Firebase removed - returning empty array");
    return [];
  },

  async getAlbum(id: string): Promise<GalleryAlbum | null> {
    return null;
  },

  async createAlbum(album: Omit<GalleryAlbum, "id">): Promise<string> {
    throw new Error("Album creation is not available - backend services have been removed");
  },

  async updateAlbum(id: string, album: Partial<GalleryAlbum>): Promise<void> {
    throw new Error("Album update is not available - backend services have been removed");
  },

  async deleteAlbum(id: string): Promise<void> {
    throw new Error("Album deletion is not available - backend services have been removed");
  },

  async getMedia(): Promise<GalleryMedia[]> {
    return [];
  },

  async getImages(): Promise<GalleryMedia[]> {
    return [];
  },

  async getMediaByAlbum(albumId: string): Promise<GalleryMedia[]> {
    return [];
  },

  async getFeaturedMedia(): Promise<GalleryMedia[]> {
    return [];
  },

  async getMediaById(id: string): Promise<GalleryMedia | null> {
    return null;
  },

  async getImageById(id: string): Promise<GalleryMedia | null> {
    return null;
  },

  async createMedia(media: GalleryMediaRequest, uploadedBy: string): Promise<string> {
    throw new Error("Media creation is not available - backend services have been removed");
  },

  async createImage(data: GalleryMediaRequest, uploadedBy: string): Promise<string> {
    throw new Error("Image creation is not available - backend services have been removed");
  },

  async updateMedia(id: string, media: Partial<GalleryMediaRequest>): Promise<void> {
    throw new Error("Media update is not available - backend services have been removed");
  },

  async updateImage(id: string, data: Partial<GalleryMediaRequest>): Promise<void> {
    throw new Error("Image update is not available - backend services have been removed");
  },

  async deleteMedia(id: string): Promise<void> {
    throw new Error("Media deletion is not available - backend services have been removed");
  },

  async deleteImage(id: string): Promise<void> {
    throw new Error("Image deletion is not available - backend services have been removed");
  },

  async getStats() {
    return { albums: 0, total: 0, featured: 0, photos: 0, videos: 0 };
  },
};
