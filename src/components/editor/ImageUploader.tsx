import React, { useState, useCallback, useRef } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { compressImage, getFileSizeReduction } from '@/lib/imageUtils';
import Button from '@/components/ui/Button';

interface ImageUploaderProps {
  onUpload: (url: string, publicId: string) => void;
  currentImage?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'free';
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export default function ImageUploader({
  onUpload,
  currentImage,
  aspectRatio = 'free',
  maxSize = 5,
  className,
  disabled = false
}: ImageUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!files.length || disabled) return;

    const file = files[0];
    
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null
    });

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Compress image before upload (save bandwidth & storage)
      console.log('Original file size:', file.size, 'bytes');
      const compressedFile = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.85,
        format: 'jpeg'
      });
      console.log('Compressed file size:', compressedFile.size, 'bytes');
      console.log('Size reduction:', getFileSizeReduction(file.size, compressedFile.size));

      // Create form data with compressed file
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('folder', 'landing-pages');
      formData.append('tags', 'landing-page-builder');

      // Upload using our API route
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const { data } = await response.json();

      // Success
      setUploadState({
        isUploading: false,
        progress: 100,
        error: null
      });

      // Update the preview with the actual URL
      setPreview(data.url);
      onUpload(data.url, data.publicId);

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      
      // Reset preview on error
      setPreview(currentImage || null);
    }
  }, [onUpload, currentImage, disabled]);

  // Handle file rejection
  const handleFileRejection = useCallback((fileRejections: FileRejection[]) => {
    const rejection = fileRejections[0];
    if (rejection?.errors[0]) {
      const error = rejection.errors[0];
      let errorMessage = 'File upload failed';
      
      switch (error.code) {
        case 'file-too-large':
          errorMessage = `File is too large. Maximum size is ${maxSize}MB.`;
          break;
        case 'file-invalid-type':
          errorMessage = 'Invalid file type. Please upload JPG, PNG, WebP or GIF files.';
          break;
        case 'too-many-files':
          errorMessage = 'Please upload only one file at a time.';
          break;
        default:
          errorMessage = error.message;
      }

      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage
      });
    }
  }, [maxSize]);

  // Dropzone configuration
  const dropzoneOptions: DropzoneOptions = {
    onDrop: handleFileUpload,
    onDropRejected: handleFileRejection,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    disabled: disabled || uploadState.isUploading,
    noClick: true, // Disable dropzone's default click behavior to avoid conflicts
    noKeyboard: true // Disable keyboard interactions for dropzone
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  // Handle manual file selection
  const handleBrowseClick = (e?: React.MouseEvent) => {
    console.log('🔍 handleBrowseClick called');
    e?.preventDefault();
    e?.stopPropagation();
    console.log('Browse button clicked, fileInputRef:', fileInputRef.current);
    
    if (fileInputRef.current) {
      console.log('🚀 Attempting to click file input');
      try {
        // Temporarily make input more visible to avoid browser security blocks
        const input = fileInputRef.current;
        const originalStyle = input.style.cssText;
        
        // Make input temporarily visible but off-screen
        input.style.cssText = 'position: fixed; left: -1000px; top: -1000px; width: 1px; height: 1px; opacity: 0.01;';
        
        // Click the input
        input.click();
        
        // Restore original styles after a brief delay
        setTimeout(() => {
          input.style.cssText = originalStyle;
        }, 100);
        
        console.log('✅ File input click triggered with visibility fix');
      } catch (error) {
        console.error('❌ Error clicking file input:', error);
      }
    } else {
      console.log('❌ File input ref not found');
    }
  };

  // Handle file input change
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const files = event.target.files;
    if (files && files.length > 0) {
      console.log('File selected:', files[0].name);
      handleFileUpload([files[0]]);
      // Clear the input value to allow re-selecting the same file
      event.target.value = '';
    } else {
      console.log('No files selected');
    }
  };

  // Handle remove image
  const handleRemoveImage = () => {
    setPreview(null);
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null
    });
    onUpload('', '');
  };

  // Get aspect ratio classes
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case '16:9':
        return 'aspect-video';
      case '4:3':
        return 'aspect-[4/3]';
      case '1:1':
        return 'aspect-square';
      default:
        return 'min-h-[200px]';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        onClick={(e) => {
          console.log('📦 Upload area clicked');
          handleBrowseClick(e);
        }}
        className={cn(
          'relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer',
          getAspectRatioClass(),
          {
            'border-blue-400 bg-blue-50': isDragActive,
            'border-gray-300 hover:border-gray-400': !isDragActive && !uploadState.error,
            'border-red-300 bg-red-50': uploadState.error,
            'opacity-50 cursor-not-allowed': disabled || uploadState.isUploading,
          }
        )}
      >
        {/* File input - positioned off-screen instead of hidden to avoid browser security blocks */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            opacity: 0,
            pointerEvents: 'none'
          }}
        />

        {/* Preview Image */}
        {preview && !uploadState.isUploading && (
          <div className="absolute inset-0">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBrowseClick();
                  }}
                >
                  Replace
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Upload State */}
        {!preview && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            {uploadState.isUploading ? (
              <div className="space-y-4">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Uploading...</p>
                  <p className="text-xs text-gray-500">{uploadState.progress}%</p>
                </div>
                <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {isDragActive ? 'Drop image here' : 'Upload an image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag & drop or click to browse
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG, WebP up to {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadState.error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          {uploadState.error}
        </div>
      )}

      {/* Manual Browse Button */}
      {!preview && !uploadState.isUploading && (
        <div className="mt-3 text-center space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              console.log('🔘 Browse Files button clicked');
              handleBrowseClick(e);
            }}
            disabled={disabled}
          >
            Browse Files
          </Button>
          
          {/* Debug Test Button */}
          <button
            type="button"
            onClick={() => {
              console.log('🧪 Test button clicked');
              console.log('FileInputRef current:', fileInputRef.current);
              if (fileInputRef.current) {
                console.log('🧪 Direct click attempt');
                fileInputRef.current.click();
              }
            }}
            className="block mx-auto text-xs text-gray-500 underline"
          >
            [DEBUG] Test File Input
          </button>
        </div>
      )}
    </div>
  );
}