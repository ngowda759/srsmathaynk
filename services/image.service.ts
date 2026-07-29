/**
 * Image Service
 * Handles image optimization and processing
 */
import sharp from 'sharp'

interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png' | 'avif'
}

interface ProcessedImage {
  buffer: Buffer
  width: number
  height: number
  format: string
  size: number
}

class ImageService {
  private defaultQuality = 80
  private maxWidth = 1920
  private maxHeight = 1080

  /**
   * Optimize an image
   */
  async optimize(
    inputBuffer: Buffer,
    options: OptimizeImageOptions = {}
  ): Promise<ProcessedImage> {
    const {
      width = this.maxWidth,
      height = this.maxHeight,
      quality = this.defaultQuality,
      format = 'webp',
    } = options

    let transformer = sharp(inputBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .grayscale(false)

    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        transformer = transformer.webp({ quality })
        break
      case 'avif':
        transformer = transformer.avif({ quality })
        break
      case 'jpeg':
        transformer = transformer.jpeg({ quality, progressive: true })
        break
      case 'png':
        transformer = transformer.png({ compressionLevel: 9 })
        break
    }

    const [output, metadata] = await Promise.all([
      transformer.toBuffer(),
      sharp(inputBuffer).metadata(),
    ])

    return {
      buffer: output,
      width: metadata.width || width,
      height: metadata.height || height,
      format: metadata.format || format,
      size: output.length,
    }
  }

  /**
   * Generate thumbnail
   */
  async generateThumbnail(
    inputBuffer: Buffer,
    size: number = 200
  ): Promise<ProcessedImage> {
    return this.optimize(inputBuffer, {
      width: size,
      height: size,
      quality: 70,
      format: 'webp',
    })
  }

  /**
   * Get image metadata without processing
   */
  async getMetadata(inputBuffer: Buffer): Promise<{
    width: number
    height: number
    format: string
    size: number
    hasAlpha: boolean
  }> {
    const metadata = await sharp(inputBuffer).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: inputBuffer.length,
      hasAlpha: metadata.hasAlpha || false,
    }
  }

  /**
   * Resize to specific dimensions
   */
  async resize(
    inputBuffer: Buffer,
    width: number,
    height: number,
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'cover'
  ): Promise<ProcessedImage> {
    const output = await sharp(inputBuffer)
      .resize(width, height, { fit })
      .webp({ quality: this.defaultQuality })
      .toBuffer()

    const metadata = await sharp(output).metadata()

    return {
      buffer: output,
      width: metadata.width || width,
      height: metadata.height || height,
      format: 'webp',
      size: output.length,
    }
  }

  /**
   * Create responsive image sizes
   */
  async createResponsiveSizes(
    inputBuffer: Buffer,
    sizes: number[] = [640, 960, 1280, 1920]
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = []

    for (const width of sizes) {
      const result = await this.optimize(inputBuffer, { width })
      results.push(result)
    }

    return results
  }

  /**
   * Convert format
   */
  async convertFormat(
    inputBuffer: Buffer,
    format: 'webp' | 'jpeg' | 'png' | 'avif',
    quality: number = this.defaultQuality
  ): Promise<Buffer> {
    let transformer = sharp(inputBuffer)

    switch (format) {
      case 'webp':
        transformer = transformer.webp({ quality })
        break
      case 'avif':
        transformer = transformer.avif({ quality })
        break
      case 'jpeg':
        transformer = transformer.jpeg({ quality, progressive: true })
        break
      case 'png':
        transformer = transformer.png({ compressionLevel: 9 })
        break
    }

    return transformer.toBuffer()
  }

  /**
   * Generate blur placeholder (base64)
   */
  async generateBlurPlaceholder(inputBuffer: Buffer): Promise<string> {
    const resized = await sharp(inputBuffer)
      .resize(10, 10, { fit: 'cover' })
      .blur(1)
      .webp({ quality: 20 })
      .toBuffer()

    return `data:image/webp;base64,${resized.toString('base64')}`
  }

  /**
   * Check if buffer is a valid image
   */
  isValidImage(buffer: Buffer): boolean {
    try {
      sharp(buffer).metadata()
      return true
    } catch {
      return false
    }
  }
}

export const imageService = new ImageService()
