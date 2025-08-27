import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with server-side credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  console.log('Upload API called');
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'landing-pages';
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',') : ['landing-page-builder'];

    console.log('Upload details:', {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      folder,
      tags
    });

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type) || file.size > maxSize) {
      return NextResponse.json(
        { error: 'Invalid file type or size. Please upload JPG, PNG, WebP or GIF under 5MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using signed upload (server-side)
    console.log('Starting Cloudinary upload with config:', {
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      folder,
      tags
    });
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          tags,
          resource_type: 'auto',
          // Enhanced optimizations for free plan
          quality: 'auto:good',           // Good quality with smaller size
          fetch_format: 'auto',           // WebP when supported
          flags: 'progressive',           // Progressive JPEG
          // Auto-resize large images to save storage
          transformation: [
            {
              width: 1920,              // Max width for web display
              height: 1080,             // Max height for web display  
              crop: 'limit'             // Only resize if larger
            },
            {
              quality: 'auto:good',     // Apply quality optimization
              fetch_format: 'auto'      // Apply format optimization
            }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result?.secure_url);
            console.log('Original size:', file.size, 'bytes, Optimized size:', result?.bytes, 'bytes');
            resolve(result);
          }
        }
      ).end(buffer);
    }) as any;

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Upload failed',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}