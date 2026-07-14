/**
 * Storage Service using Supabase Storage
 * Files are stored in Supabase Storage buckets
 */
import { createClient } from '@/lib/supabase/client'

const BUCKETS = {
  IMAGES: 'images',
  GALLERY: 'gallery',
  DOCUMENTS: 'documents',
  PROFILE_PHOTOS: 'profile-photos',
} as const

class StorageService {
  /**
   * Get a public URL for a file in Supabase Storage
   */
  getPublicUrl(bucket: string, path: string): string {
    const supabase = createClient()
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  /**
   * Upload an image file
   */
  async uploadImage(
    bucket: string,
    path: string,
    file: File | Blob,
    options?: { contentType?: string; upsert?: boolean }
  ): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: options?.contentType || 'image/jpeg',
          upsert: options?.upsert || false,
        })

      if (error) {
        return { success: false, error: error.message }
      }

      const url = this.getPublicUrl(bucket, data.path)
      return { success: true, url }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Delete a file from Supabase Storage
   */
  async deleteFile(bucket: string, path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      const { error } = await supabase.storage.from(bucket).remove([path])

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * List files in a bucket folder
   */
  async listFiles(
    bucket: string,
    folder?: string
  ): Promise<{ success: boolean; files?: Array<{ name: string; url: string }>; error?: string }> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.storage.from(bucket).list(folder || '', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      const files = data
        .filter((file) => file.id !== null)
        .map((file) => ({
          name: file.name,
          url: this.getPublicUrl(bucket, folder ? `${folder}/${file.name}` : file.name),
        }))

      return { success: true, files }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  }

  /**
   * Get image URL from public/images folder
   */
  getImageUrl(filename: string, folder: string = 'aaradhane'): string {
    return `/images/${folder}/${filename}`
  }

  /**
   * Get gallery image URL
   */
  getGalleryUrl(path: string): string {
    return this.getPublicUrl(BUCKETS.GALLERY, path)
  }

  /**
   * Get profile photo URL
   */
  getProfilePhotoUrl(path: string): string {
    return this.getPublicUrl(BUCKETS.PROFILE_PHOTOS, path)
  }
}

export const storageService = new StorageService()
export { BUCKETS }
