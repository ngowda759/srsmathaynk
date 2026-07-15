/**
 * Gallery Service - Prisma-based implementation (Sprint 4.2)
 * Full CRUD operations for gallery albums, items, and categories
 */

import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { handlePrismaError } from "@/lib/errors";
import { storageService, BUCKETS } from "@/services/storage.service";
import {
  GalleryAlbumType,
  GalleryAlbumRequest,
  GalleryAlbumQuery,
  GalleryItemType,
  GalleryItemRequest,
  GalleryItemQuery,
  GalleryCategoryType,
  GalleryCategoryRequest,
  GalleryTagType,
  GalleryStats,
  AlbumStats,
} from "@/types/gallery";
import type { Prisma } from "@prisma/client";

// =============================================================================
// TRANSFORMERS
// =============================================================================

function getMediaUrl(media: { id: string; bucket: string; storagePath: string } | null): { id: string; url: string; thumbnailUrl?: string } | null {
  if (!media) return null;
  const url = storageService.getPublicUrl(media.bucket, media.storagePath);
  return {
    id: media.id,
    url,
    thumbnailUrl: url, // Could generate thumbnail URL here
  };
}

function transformAlbum(prismaAlbum: any): GalleryAlbumType {
  return {
    id: prismaAlbum.id,
    title: prismaAlbum.title,
    titleKn: prismaAlbum.titleKn,
    slug: prismaAlbum.slug,
    description: prismaAlbum.description,
    descriptionKn: prismaAlbum.descriptionKn,
    coverImageId: prismaAlbum.coverImageId,
    coverImage: getMediaUrl(prismaAlbum.coverImage),
    categoryId: prismaAlbum.categoryId,
    category: prismaAlbum.category
      ? { id: prismaAlbum.category.id, name: prismaAlbum.category.name, slug: prismaAlbum.category.slug }
      : null,
    festivalId: prismaAlbum.festivalId,
    festival: prismaAlbum.festival
      ? { id: prismaAlbum.festival.id, title: prismaAlbum.festival.title, startDate: prismaAlbum.festival.startDate }
      : null,
    status: prismaAlbum.status,
    visibility: prismaAlbum.visibility,
    featured: prismaAlbum.featured,
    published: prismaAlbum.published,
    photoCount: prismaAlbum.photoCount,
    videoCount: prismaAlbum.videoCount,
    displayOrder: prismaAlbum.displayOrder,
    location: prismaAlbum.location,
    eventDate: prismaAlbum.eventDate,
    createdAt: prismaAlbum.createdAt,
    updatedAt: prismaAlbum.updatedAt,
    deletedAt: prismaAlbum.deletedAt,
    createdById: prismaAlbum.createdById,
    updatedById: prismaAlbum.updatedById,
  };
}

function transformItem(prismaItem: any): GalleryItemType {
  return {
    id: prismaItem.id,
    title: prismaItem.title,
    titleKn: prismaItem.titleKn,
    description: prismaItem.description,
    descriptionKn: prismaItem.descriptionKn,
    mediaId: prismaItem.mediaId,
    media: prismaItem.media
      ? {
          id: prismaItem.media.id,
          url: storageService.getPublicUrl(prismaItem.media.bucket, prismaItem.media.storagePath),
          filename: prismaItem.media.filename,
          mimeType: prismaItem.media.mimeType,
          fileSize: prismaItem.media.fileSize,
          width: prismaItem.media.width,
          height: prismaItem.media.height,
          duration: prismaItem.media.duration,
        }
      : null,
    type: prismaItem.type,
    altText: prismaItem.altText,
    caption: prismaItem.caption,
    captionKn: prismaItem.captionKn,
    featured: prismaItem.featured,
    showOnHome: prismaItem.showOnHome,
    displayOrder: prismaItem.displayOrder,
    width: prismaItem.width,
    height: prismaItem.height,
    fileSize: prismaItem.fileSize,
    duration: prismaItem.duration,
    tags: prismaItem.tags || [],
    viewCount: prismaItem.viewCount,
    createdAt: prismaItem.createdAt,
    updatedAt: prismaItem.updatedAt,
    deletedAt: prismaItem.deletedAt,
    uploadedById: prismaItem.uploadedById,
    albumIds: prismaItem.albums?.map((a: any) => a.albumId) || [],
  };
}

function transformCategory(prismaCategory: any): GalleryCategoryType {
  return {
    id: prismaCategory.id,
    name: prismaCategory.name,
    nameKn: prismaCategory.nameKn,
    description: prismaCategory.description,
    slug: prismaCategory.slug,
    icon: prismaCategory.icon,
    color: prismaCategory.color,
    order: prismaCategory.order,
    active: prismaCategory.active,
    year: prismaCategory.year,
    createdAt: prismaCategory.createdAt,
    updatedAt: prismaCategory.updatedAt,
  };
}

function transformTag(prismaTag: any): GalleryTagType {
  return {
    id: prismaTag.id,
    name: prismaTag.name,
    slug: prismaTag.slug,
    createdAt: prismaTag.createdAt,
    updatedAt: prismaTag.updatedAt,
  };
}

// =============================================================================
// ALBUM SERVICE
// =============================================================================

class AlbumService {
  async getAlbums(query?: GalleryAlbumQuery): Promise<GalleryAlbumType[]> {
    try {
      const where: Prisma.GalleryAlbumWhereInput = {
        deletedAt: null,
      };

      if (query?.status) {
        where.status = query.status;
      }

      if (query?.categoryId) {
        where.categoryId = query.categoryId;
      }

      if (query?.festivalId) {
        where.festivalId = query.festivalId;
      }

      if (query?.featured !== undefined) {
        where.featured = query.featured;
      }

      if (query?.published !== undefined) {
        where.published = query.published;
      }

      if (query?.year) {
        where.eventDate = {
          gte: new Date(`${query.year}-01-01`),
          lte: new Date(`${query.year}-12-31`),
        };
      }

      // Enhanced search across multiple fields
      if (query?.search) {
        const search = query.search.trim();
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { titleKn: { contains: search } },
            { description: { contains: search, mode: "insensitive" } },
            { descriptionKn: { contains: search } },
            { location: { contains: search, mode: "insensitive" } },
            // Search in category name
            { category: { name: { contains: search, mode: "insensitive" } } },
            { category: { nameKn: { contains: search } } },
            // Search in festival title
            { festival: { title: { contains: search, mode: "insensitive" } } },
            { festival: { titleKn: { contains: search } } },
          ];
        }
      }

      const page = query?.page || 1;
      const limit = query?.limit || 20;
      const skip = (page - 1) * limit;

      const sortBy = query?.sortBy || "displayOrder";
      const sortOrder = query?.sortOrder || "asc";

      const albums = await prisma.galleryAlbum.findMany({
        where,
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, titleKn: true, startDate: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      });

      return albums.map(transformAlbum);
    } catch (error) {
      logger.error("[GalleryService] Failed to get albums", error);
      throw handlePrismaError(error);
    }
  }

  async getAlbum(id: string): Promise<GalleryAlbumType | null> {
    try {
      const album = await prisma.galleryAlbum.findUnique({
        where: { id },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      if (!album || album.deletedAt) {
        return null;
      }

      return transformAlbum(album);
    } catch (error) {
      logger.error("[GalleryService] Failed to get album", error);
      throw handlePrismaError(error);
    }
  }

  async getAlbumBySlug(slug: string): Promise<GalleryAlbumType | null> {
    try {
      const album = await prisma.galleryAlbum.findUnique({
        where: { slug, deletedAt: null },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      return album ? transformAlbum(album) : null;
    } catch (error) {
      logger.error("[GalleryService] Failed to get album by slug", error);
      throw handlePrismaError(error);
    }
  }

  async getAlbumWithItems(id: string, page = 1, limit = 50): Promise<{ album: GalleryAlbumType; items: GalleryItemType[]; total: number }> {
    try {
      const album = await prisma.galleryAlbum.findUnique({
        where: { id },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      if (!album || album.deletedAt) {
        throw new Error("Album not found");
      }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        prisma.albumItem.findMany({
          where: { albumId: id },
          include: {
            item: {
              include: { media: true },
            },
          },
          orderBy: { displayOrder: "asc" },
          skip,
          take: limit,
        }),
        prisma.albumItem.count({ where: { albumId: id } }),
      ]);

      return {
        album: transformAlbum(album),
        items: items.map((ai) => transformItem(ai.item)),
        total,
      };
    } catch (error) {
      logger.error("[GalleryService] Failed to get album with items", error);
      throw handlePrismaError(error);
    }
  }

  /**
   * Generate a unique slug from a base slug
   */
  private async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await prisma.galleryAlbum.findFirst({
        where: {
          slug,
          ...(excludeId ? { id: { not: excludeId } } : {}),
        },
      });
      
      if (!existing) return slug;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async createAlbum(data: GalleryAlbumRequest, userId?: string): Promise<GalleryAlbumType> {
    try {
      // Generate slug from title if not provided
      const baseSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const slug = await this.generateUniqueSlug(baseSlug);

      const album = await prisma.galleryAlbum.create({
        data: {
          title: data.title,
          titleKn: data.titleKn,
          slug,
          description: data.description,
          descriptionKn: data.descriptionKn,
          coverImageId: data.coverImageId,
          categoryId: data.categoryId,
          festivalId: data.festivalId,
          status: data.status || "DRAFT",
          visibility: data.visibility || "PRIVATE",
          featured: data.featured || false,
          published: data.published || false,
          displayOrder: data.displayOrder || 0,
          location: data.location,
          eventDate: data.eventDate ? new Date(data.eventDate) : null,
          createdById: userId,
        },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      logger.info("[GalleryService] Album created", { albumId: album.id });
      return transformAlbum(album);
    } catch (error) {
      logger.error("[GalleryService] Failed to create album", error);
      throw handlePrismaError(error);
    }
  }

  async updateAlbum(id: string, data: Partial<GalleryAlbumRequest>, userId?: string): Promise<GalleryAlbumType> {
    try {
      // Check if title changed and update slug
      let newSlug: string | undefined;
      if (data.title !== undefined) {
        const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
        if (existing && existing.title !== data.title) {
          // Title changed - generate new slug based on new title
          const baseSlug = data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
          newSlug = await this.generateUniqueSlug(baseSlug, id);
        }
      }

      const updateData: Prisma.GalleryAlbumUpdateInput = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (newSlug !== undefined) updateData.slug = newSlug;
      if (data.titleKn !== undefined) updateData.titleKn = data.titleKn;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.descriptionKn !== undefined) updateData.descriptionKn = data.descriptionKn;
      if (data.coverImageId !== undefined) updateData.coverImageId = data.coverImageId;
      if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
      if (data.festivalId !== undefined) updateData.festivalId = data.festivalId;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.visibility !== undefined) updateData.visibility = data.visibility;
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.published !== undefined) updateData.published = data.published;
      if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.eventDate !== undefined) updateData.eventDate = data.eventDate ? new Date(data.eventDate) : null;
      if (userId !== undefined) updateData.updatedById = userId;

      const album = await prisma.galleryAlbum.update({
        where: { id },
        data: updateData,
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      logger.info("[GalleryService] Album updated", { albumId: id });
      return transformAlbum(album);
    } catch (error) {
      logger.error("[GalleryService] Failed to update album", error);
      throw handlePrismaError(error);
    }
  }

  async deleteAlbum(id: string): Promise<void> {
    try {
      await prisma.galleryAlbum.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      logger.info("[GalleryService] Album deleted", { albumId: id });
    } catch (error) {
      logger.error("[GalleryService] Failed to delete album", error);
      throw handlePrismaError(error);
    }
  }

  async toggleFeatured(id: string): Promise<GalleryAlbumType> {
    try {
      const album = await prisma.galleryAlbum.findUnique({ where: { id } });
      if (!album) {
        throw new Error("Album not found");
      }

      const updated = await prisma.galleryAlbum.update({
        where: { id },
        data: { featured: !album.featured },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      return transformAlbum(updated);
    } catch (error) {
      logger.error("[GalleryService] Failed to toggle featured", error);
      throw handlePrismaError(error);
    }
  }

  async togglePublished(id: string): Promise<GalleryAlbumType> {
    try {
      const album = await prisma.galleryAlbum.findUnique({ where: { id } });
      if (!album) {
        throw new Error("Album not found");
      }

      const updated = await prisma.galleryAlbum.update({
        where: { id },
        data: { published: !album.published },
        include: {
          coverImage: true,
          category: true,
          festival: { select: { id: true, title: true, startDate: true } },
        },
      });

      return transformAlbum(updated);
    } catch (error) {
      logger.error("[GalleryService] Failed to toggle published", error);
      throw handlePrismaError(error);
    }
  }

  async reorderAlbums(albumIds: string[]): Promise<void> {
    try {
      await prisma.$transaction(
        albumIds.map((id, index) =>
          prisma.galleryAlbum.update({
            where: { id },
            data: { displayOrder: index },
          })
        )
      );
      logger.info("[GalleryService] Albums reordered");
    } catch (error) {
      logger.error("[GalleryService] Failed to reorder albums", error);
      throw handlePrismaError(error);
    }
  }

  async updateAlbumCounts(albumId: string): Promise<void> {
    try {
      const [photoCount, videoCount] = await Promise.all([
        prisma.albumItem.count({
          where: {
            albumId,
            item: { type: "PHOTO" },
          },
        }),
        prisma.albumItem.count({
          where: {
            albumId,
            item: { type: "VIDEO" },
          },
        }),
      ]);

      await prisma.galleryAlbum.update({
        where: { id: albumId },
        data: { photoCount, videoCount },
      });
    } catch (error) {
      logger.error("[GalleryService] Failed to update album counts", error);
    }
  }
}

// =============================================================================
// ITEM SERVICE
// =============================================================================

class ItemService {
  async getItems(query?: GalleryItemQuery): Promise<GalleryItemType[]> {
    try {
      const where: Prisma.GalleryItemWhereInput = {
        deletedAt: null,
      };

      if (query?.type) {
        where.type = query.type;
      }

      if (query?.featured !== undefined) {
        where.featured = query.featured;
      }

      if (query?.showOnHome !== undefined) {
        where.showOnHome = query.showOnHome;
      }

      if (query?.albumId) {
        where.albums = { some: { albumId: query.albumId } };
      }

      if (query?.search) {
        const search = query.search.trim();
        if (search) {
          where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { caption: { contains: search, mode: "insensitive" } },
          ];
        }
      }

      if (query?.tags && query.tags.length > 0) {
        where.tags = { hasSome: query.tags };
      }

      const page = query?.page || 1;
      const limit = query?.limit || 50;
      const skip = (page - 1) * limit;

      const items = await prisma.galleryItem.findMany({
        where,
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
        orderBy: { displayOrder: "asc" },
        skip,
        take: limit,
      });

      return items.map(transformItem);
    } catch (error) {
      logger.error("[GalleryService] Failed to get items", error);
      throw handlePrismaError(error);
    }
  }

  async getItem(id: string): Promise<GalleryItemType | null> {
    try {
      const item = await prisma.galleryItem.findUnique({
        where: { id },
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
      });

      if (!item || item.deletedAt) {
        return null;
      }

      // Increment view count
      await prisma.galleryItem.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });

      return transformItem(item);
    } catch (error) {
      logger.error("[GalleryService] Failed to get item", error);
      throw handlePrismaError(error);
    }
  }

  async createItem(data: GalleryItemRequest, userId?: string): Promise<GalleryItemType> {
    try {
      const item = await prisma.galleryItem.create({
        data: {
          title: data.title,
          titleKn: data.titleKn,
          description: data.description,
          descriptionKn: data.descriptionKn,
          mediaId: data.mediaId,
          type: data.type || "PHOTO",
          altText: data.altText,
          caption: data.caption,
          captionKn: data.captionKn,
          featured: data.featured || false,
          showOnHome: data.showOnHome || false,
          displayOrder: data.displayOrder || 0,
          tags: data.tags || [],
          uploadedById: userId,
        },
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
      });

      logger.info("[GalleryService] Item created", { itemId: item.id });
      return transformItem(item);
    } catch (error) {
      logger.error("[GalleryService] Failed to create item", error);
      throw handlePrismaError(error);
    }
  }

  async updateItem(id: string, data: Partial<GalleryItemRequest>): Promise<GalleryItemType> {
    try {
      const updateData: Prisma.GalleryItemUpdateInput = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.titleKn !== undefined) updateData.titleKn = data.titleKn;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.descriptionKn !== undefined) updateData.descriptionKn = data.descriptionKn;
      if (data.mediaId !== undefined) updateData.mediaId = data.mediaId;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.altText !== undefined) updateData.altText = data.altText;
      if (data.caption !== undefined) updateData.caption = data.caption;
      if (data.captionKn !== undefined) updateData.captionKn = data.captionKn;
      if (data.featured !== undefined) updateData.featured = data.featured;
      if (data.showOnHome !== undefined) updateData.showOnHome = data.showOnHome;
      if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
      if (data.tags !== undefined) updateData.tags = data.tags;

      const item = await prisma.galleryItem.update({
        where: { id },
        data: updateData,
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
      });

      logger.info("[GalleryService] Item updated", { itemId: id });
      return transformItem(item);
    } catch (error) {
      logger.error("[GalleryService] Failed to update item", error);
      throw handlePrismaError(error);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      await prisma.galleryItem.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      logger.info("[GalleryService] Item deleted", { itemId: id });
    } catch (error) {
      logger.error("[GalleryService] Failed to delete item", error);
      throw handlePrismaError(error);
    }
  }

  async addItemToAlbum(itemId: string, albumId: string, displayOrder = 0): Promise<void> {
    try {
      await prisma.albumItem.create({
        data: {
          itemId,
          albumId,
          displayOrder,
        },
      });

      // Update album counts
      await albumService.updateAlbumCounts(albumId);
    } catch (error) {
      logger.error("[GalleryService] Failed to add item to album", error);
      throw handlePrismaError(error);
    }
  }

  async removeItemFromAlbum(itemId: string, albumId: string): Promise<void> {
    try {
      await prisma.albumItem.deleteMany({
        where: { itemId, albumId },
      });

      // Update album counts
      await albumService.updateAlbumCounts(albumId);
    } catch (error) {
      logger.error("[GalleryService] Failed to remove item from album", error);
      throw handlePrismaError(error);
    }
  }

  async reorderAlbumItems(albumId: string, itemIds: string[]): Promise<void> {
    try {
      await prisma.$transaction(
        itemIds.map((itemId, index) =>
          prisma.albumItem.updateMany({
            where: { albumId, itemId },
            data: { displayOrder: index },
          })
        )
      );
      logger.info("[GalleryService] Album items reordered", { albumId });
    } catch (error) {
      logger.error("[GalleryService] Failed to reorder album items", error);
      throw handlePrismaError(error);
    }
  }

  async toggleFeatured(id: string): Promise<GalleryItemType> {
    try {
      const item = await prisma.galleryItem.findUnique({ where: { id } });
      if (!item) {
        throw new Error("Item not found");
      }

      const updated = await prisma.galleryItem.update({
        where: { id },
        data: { featured: !item.featured },
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
      });

      return transformItem(updated);
    } catch (error) {
      logger.error("[GalleryService] Failed to toggle featured", error);
      throw handlePrismaError(error);
    }
  }

  async toggleShowOnHome(id: string): Promise<GalleryItemType> {
    try {
      const item = await prisma.galleryItem.findUnique({ where: { id } });
      if (!item) {
        throw new Error("Item not found");
      }

      const updated = await prisma.galleryItem.update({
        where: { id },
        data: { showOnHome: !item.showOnHome },
        include: {
          media: true,
          albums: { select: { albumId: true } },
        },
      });

      return transformItem(updated);
    } catch (error) {
      logger.error("[GalleryService] Failed to toggle showOnHome", error);
      throw handlePrismaError(error);
    }
  }
}

// =============================================================================
// CATEGORY SERVICE
// =============================================================================

class CategoryService {
  async getCategories(activeOnly = true): Promise<GalleryCategoryType[]> {
    try {
      const where = activeOnly ? { active: true } : {};
      
      const categories = await prisma.galleryCategory.findMany({
        where,
        orderBy: { order: "asc" },
      });

      return categories.map(transformCategory);
    } catch (error) {
      logger.error("[GalleryService] Failed to get categories", error);
      throw handlePrismaError(error);
    }
  }

  async getCategory(id: string): Promise<GalleryCategoryType | null> {
    try {
      const category = await prisma.galleryCategory.findUnique({
        where: { id },
      });

      return category ? transformCategory(category) : null;
    } catch (error) {
      logger.error("[GalleryService] Failed to get category", error);
      throw handlePrismaError(error);
    }
  }

  async createCategory(data: GalleryCategoryRequest): Promise<GalleryCategoryType> {
    try {
      const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const category = await prisma.galleryCategory.create({
        data: {
          name: data.name,
          nameKn: data.nameKn,
          description: data.description,
          slug,
          icon: data.icon,
          color: data.color,
          order: data.order || 0,
          active: data.active ?? true,
          year: data.year,
        },
      });

      logger.info("[GalleryService] Category created", { categoryId: category.id });
      return transformCategory(category);
    } catch (error) {
      logger.error("[GalleryService] Failed to create category", error);
      throw handlePrismaError(error);
    }
  }

  async updateCategory(id: string, data: Partial<GalleryCategoryRequest>): Promise<GalleryCategoryType> {
    try {
      const updateData: Prisma.GalleryCategoryUpdateInput = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.nameKn !== undefined) updateData.nameKn = data.nameKn;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.icon !== undefined) updateData.icon = data.icon;
      if (data.color !== undefined) updateData.color = data.color;
      if (data.order !== undefined) updateData.order = data.order;
      if (data.active !== undefined) updateData.active = data.active;
      if (data.year !== undefined) updateData.year = data.year;

      const category = await prisma.galleryCategory.update({
        where: { id },
        data: updateData,
      });

      logger.info("[GalleryService] Category updated", { categoryId: id });
      return transformCategory(category);
    } catch (error) {
      logger.error("[GalleryService] Failed to update category", error);
      throw handlePrismaError(error);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await prisma.galleryCategory.delete({
        where: { id },
      });
      logger.info("[GalleryService] Category deleted", { categoryId: id });
    } catch (error) {
      logger.error("[GalleryService] Failed to delete category", error);
      throw handlePrismaError(error);
    }
  }
}

// =============================================================================
// TAG SERVICE
// =============================================================================

class TagService {
  async getTags(): Promise<GalleryTagType[]> {
    try {
      const tags = await prisma.galleryTag.findMany({
        orderBy: { name: "asc" },
      });

      return tags.map(transformTag);
    } catch (error) {
      logger.error("[GalleryService] Failed to get tags", error);
      throw handlePrismaError(error);
    }
  }

  async createTag(name: string): Promise<GalleryTagType> {
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const tag = await prisma.galleryTag.create({
        data: { name, slug },
      });

      return transformTag(tag);
    } catch (error) {
      logger.error("[GalleryService] Failed to create tag", error);
      throw handlePrismaError(error);
    }
  }

  async deleteTag(id: string): Promise<void> {
    try {
      await prisma.galleryTag.delete({
        where: { id },
      });
    } catch (error) {
      logger.error("[GalleryService] Failed to delete tag", error);
      throw handlePrismaError(error);
    }
  }
}

// =============================================================================
// STATS SERVICE
// =============================================================================

class StatsService {
  async getStats(): Promise<GalleryStats> {
    try {
      const [total, featured, albums, photos, videos] = await Promise.all([
        prisma.galleryItem.count({ where: { deletedAt: null } }),
        prisma.galleryItem.count({ where: { deletedAt: null, featured: true } }),
        prisma.galleryAlbum.count({ where: { deletedAt: null } }),
        prisma.galleryItem.count({ where: { deletedAt: null, type: "PHOTO" } }),
        prisma.galleryItem.count({ where: { deletedAt: null, type: "VIDEO" } }),
      ]);

      // Get counts by category
      const categories = await prisma.galleryCategory.findMany({
        include: { _count: { select: { albums: true } } },
      });

      const byCategory: Record<string, number> = {};
      categories.forEach((cat) => {
        byCategory[cat.name] = cat._count.albums;
      });

      return { total, featured, albums, photos, videos, byCategory };
    } catch (error) {
      logger.error("[GalleryService] Failed to get stats", error);
      throw handlePrismaError(error);
    }
  }

  async getAlbumStats(albumId: string): Promise<AlbumStats> {
    try {
      const [totalItems, photos, videos] = await Promise.all([
        prisma.albumItem.count({ where: { albumId } }),
        prisma.albumItem.count({ where: { albumId, item: { type: "PHOTO" } } }),
        prisma.albumItem.count({ where: { albumId, item: { type: "VIDEO" } } }),
      ]);

      return { totalItems, photos, videos };
    } catch (error) {
      logger.error("[GalleryService] Failed to get album stats", error);
      throw handlePrismaError(error);
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

const albumInstance = new AlbumService();
const itemInstance = new ItemService();
const categoryInstance = new CategoryService();
const tagInstance = new TagService();
const statsInstance = new StatsService();

export const galleryService = {
  // Albums
  getAlbums: albumInstance.getAlbums.bind(albumInstance),
  getAlbum: albumInstance.getAlbum.bind(albumInstance),
  getAlbumBySlug: albumInstance.getAlbumBySlug.bind(albumInstance),
  getAlbumWithItems: albumInstance.getAlbumWithItems.bind(albumInstance),
  createAlbum: albumInstance.createAlbum.bind(albumInstance),
  updateAlbum: albumInstance.updateAlbum.bind(albumInstance),
  deleteAlbum: albumInstance.deleteAlbum.bind(albumInstance),
  toggleAlbumFeatured: albumInstance.toggleFeatured.bind(albumInstance),
  toggleAlbumPublished: albumInstance.togglePublished.bind(albumInstance),
  reorderAlbums: albumInstance.reorderAlbums.bind(albumInstance),

  // Items
  getItems: itemInstance.getItems.bind(itemInstance),
  getItem: itemInstance.getItem.bind(itemInstance),
  createItem: itemInstance.createItem.bind(itemInstance),
  updateItem: itemInstance.updateItem.bind(itemInstance),
  deleteItem: itemInstance.deleteItem.bind(itemInstance),
  addItemToAlbum: itemInstance.addItemToAlbum.bind(itemInstance),
  removeItemFromAlbum: itemInstance.removeItemFromAlbum.bind(itemInstance),
  reorderAlbumItems: itemInstance.reorderAlbumItems.bind(itemInstance),
  toggleItemFeatured: itemInstance.toggleFeatured.bind(itemInstance),
  toggleItemShowOnHome: itemInstance.toggleShowOnHome.bind(itemInstance),

  // Categories
  getCategories: categoryInstance.getCategories.bind(categoryInstance),
  getCategory: categoryInstance.getCategory.bind(categoryInstance),
  createCategory: categoryInstance.createCategory.bind(categoryInstance),
  updateCategory: categoryInstance.updateCategory.bind(categoryInstance),
  deleteCategory: categoryInstance.deleteCategory.bind(categoryInstance),

  // Tags
  getTags: tagInstance.getTags.bind(tagInstance),
  createTag: tagInstance.createTag.bind(tagInstance),
  deleteTag: tagInstance.deleteTag.bind(tagInstance),

  // Stats
  getStats: statsInstance.getStats.bind(statsInstance),
  getAlbumStats: statsInstance.getAlbumStats.bind(statsInstance),
};
