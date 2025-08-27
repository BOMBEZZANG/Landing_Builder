interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  thumbnail_url: string;
  resource_type: string;
  access_mode: string;
  url: string;
}

interface CloudinaryConfig {
  cloudName: string;
  uploadPreset: string;
  folder: string;
  transformations?: {
    quality: string;
    fetch_format: string;
  };
}

class CloudinaryError extends Error {
  http_code?: number;
  
  constructor(message: string, httpCode?: number) {
    super(message);
    this.name = 'CloudinaryError';
    this.http_code = httpCode;
  }
}

export class CloudinaryService {
  private config: CloudinaryConfig;

  constructor() {
    this.config = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default',
      folder: 'landing-pages',
      transformations: {
        quality: 'auto',
        fetch_format: 'auto'
      }
    };

    if (!this.config.cloudName) {
      throw new Error('Cloudinary cloud name is required');
    }
    
    console.log('Cloudinary config initialized:', {
      cloudName: this.config.cloudName,
      uploadPreset: this.config.uploadPreset
    });
  }

  async uploadImage(
    file: File, 
    options: {
      folder?: string;
      tags?: string[];
      transformation?: string;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<CloudinaryUploadResponse> {
    // Validate file
    if (!this.validateFile(file)) {
      throw new Error('Invalid file type or size. Please upload JPG, PNG, WebP or GIF under 5MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.config.uploadPreset);
    formData.append('folder', options.folder || this.config.folder);
    
    if (options.tags && options.tags.length > 0) {
      formData.append('tags', options.tags.join(','));
    }

    // Add transformation if provided
    if (options.transformation) {
      formData.append('transformation', options.transformation);
    }

    try {
      // Upload to Cloudinary with progress tracking
      const response = await this.uploadWithProgress(formData, options.onProgress);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { message: errorText } };
        }
        
        console.error('Cloudinary upload error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          cloudName: this.config.cloudName,
          uploadPreset: this.config.uploadPreset
        });
        
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new CloudinaryError(errorMessage);
      }

      const result: CloudinaryUploadResponse = await response.json();
      return result;
    } catch (error) {
      if (error instanceof CloudinaryError) {
        throw error;
      }
      console.error('Cloudinary upload error details:', error);
      throw new CloudinaryError(`Upload failed: ${(error as Error).message}`);
    }
  }

  private async uploadWithProgress(
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress(Math.round(progress));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            ok: true,
            json: async () => JSON.parse(xhr.responseText)
          } as Response);
        } else {
          reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error occurred'));
      });

      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'));
      });

      xhr.timeout = 30000; // 30 seconds timeout
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`);
      xhr.send(formData);
    });
  }

  validateFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png', 
      'image/webp', 
      'image/gif'
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    return validTypes.includes(file.type) && file.size <= maxSize;
  }

  getOptimizedUrl(
    url: string, 
    options: {
      width?: number;
      height?: number;
      quality?: 'auto' | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
    } = {}
  ): string {
    if (!url || !url.includes('cloudinary.com')) {
      return url; // Return original URL if not a Cloudinary URL
    }

    let transformations: string[] = [];

    // Quality
    const quality = options.quality || 'auto';
    transformations.push(`q_${quality}`);

    // Format
    const format = options.format || 'auto';
    transformations.push(`f_${format}`);

    // Dimensions
    if (options.width) {
      transformations.push(`w_${options.width}`);
    }
    if (options.height) {
      transformations.push(`h_${options.height}`);
    }

    // Crop mode
    if (options.crop && (options.width || options.height)) {
      transformations.push(`c_${options.crop}`);
    }

    // Apply transformations
    const transformString = transformations.join(',');
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  getThumbnailUrl(url: string, size: number = 150): string {
    return this.getOptimizedUrl(url, {
      width: size,
      height: size,
      crop: 'fill',
      quality: 'auto'
    });
  }

  getResponsiveUrls(url: string, breakpoints: number[] = [400, 800, 1200]): Record<string, string> {
    const urls: Record<string, string> = {};
    
    breakpoints.forEach(width => {
      urls[`${width}w`] = this.getOptimizedUrl(url, { width, quality: 'auto' });
    });

    return urls;
  }

  async deleteImage(publicId: string): Promise<boolean> {
    try {
      // Note: This requires server-side implementation due to API secret requirement
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publicId })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  // Utility methods
  extractPublicIdFromUrl(url: string): string | null {
    const matches = url.match(/\/v\d+\/(.+?)\./);
    return matches ? matches[1] : null;
  }

  isCloudinaryUrl(url: string): boolean {
    return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
  }

  generateUploadPreset(): string {
    return this.config.uploadPreset;
  }
}

// Singleton instance
export const cloudinaryService = new CloudinaryService();