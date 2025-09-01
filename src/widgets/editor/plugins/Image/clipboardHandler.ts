import { EditorState } from 'draft-js';
import { addImage } from './strategy';
import { uploadImage } from '@app/services/imageUpload.service';
import { track } from '@amplitude/analytics-browser';
import { toast } from 'react-hot-toast';
import { successToastOptions, errorToastOptions } from '@shared/common/Toast';

export interface ClipboardImageHandlerOptions {
  maxFileSizeBytes?: number;
  acceptedMimeTypes?: string[];
  workspaceId?: string;
}

const DEFAULT_OPTIONS: Required<ClipboardImageHandlerOptions> = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  acceptedMimeTypes: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    'image/avif'
  ],
  workspaceId: ''
};

/**
 * Extract image files from clipboard data
 */
export function extractImagesFromClipboard(event: ClipboardEvent): File[] {
  const items = event.clipboardData?.items;
  if (!items) return [];

  const imageFiles: File[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    
    // Check if item is an image
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        imageFiles.push(file);
      }
    }
  }
  
  return imageFiles;
}

/**
 * Validate image file against options
 */
export function validateImageFile(
  file: File, 
  options: ClipboardImageHandlerOptions
): { valid: boolean; error?: string } {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Check file size
  if (file.size > opts.maxFileSizeBytes) {
    return {
      valid: false,
      error: `File size too large: ${(file.size / 1024 / 1024).toFixed(1)}MB > ${(opts.maxFileSizeBytes / 1024 / 1024).toFixed(1)}MB`
    };
  }
  
  // Check mime type
  if (!opts.acceptedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type not supported: ${file.type}`
    };
  }
  
  return { valid: true };
}

/**
 * Handle clipboard paste with images
 */
export async function handleClipboardImagePaste(
  event: ClipboardEvent,
  editorState: EditorState,
  setEditorState: (state: EditorState) => void,
  options: ClipboardImageHandlerOptions = {}
): Promise<boolean> {
  const imageFiles = extractImagesFromClipboard(event);
  
  if (imageFiles.length === 0) {
    return false; // No images found, let default paste behavior continue
  }
  
  // Prevent default paste behavior since we found images
  event.preventDefault();
  event.stopPropagation();
  
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Process each image file
    for (const file of imageFiles) {
      // Validate file
      const validation = validateImageFile(file, opts);
      if (!validation.valid) {
        console.warn('Image paste validation failed:', validation.error);
        toast.error(validation.error || 'Image validation failed', errorToastOptions);
        continue;
      }
      
      // Track the paste event
      track('document_edit_paste_image', {
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name || 'clipboard-image'
      });
      
      // Show loading toast
      const loadingToast = toast.loading('Uploading image...', {
        duration: Infinity,
      });

      try {
        // Upload the image
        const uploadResult = await uploadImage(file, opts.workspaceId);
        
        // Insert image into editor
        const newEditorState = addImage(editorState, uploadResult.presignedObjectUrl, {
          imageId: uploadResult.id,
          altText: file.name || 'Pasted image'
        });
        
        setEditorState(newEditorState);
        
        // Update editor state for next iteration
        editorState = newEditorState;

        // Show success notification
        toast.dismiss(loadingToast);
        toast.success('Image uploaded successfully', successToastOptions);
        
      } catch (uploadError) {
        toast.dismiss(loadingToast);
        const errorMsg = uploadError instanceof Error ? uploadError.message : 'Failed to upload image';
        toast.error(errorMsg, errorToastOptions);
        throw uploadError; // Re-throw to be caught by outer try-catch
      }
    }
    
    return true; // Images were processed
  } catch (error) {
    console.error('Error handling clipboard image paste:', error);
    
    track('document_edit_paste_image_failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    const errorMsg = error instanceof Error ? error.message : 'Failed to process pasted images';
    toast.error(errorMsg, errorToastOptions);
    
    return false;
  }
}

/**
 * Create a paste event handler for the editor
 */
export function createClipboardPasteHandler(
  getEditorState: () => EditorState,
  setEditorState: (state: EditorState) => void,
  options: ClipboardImageHandlerOptions = {}
) {
  return async (event: ClipboardEvent) => {
    const editorState = getEditorState();
    await handleClipboardImagePaste(event, editorState, setEditorState, options);
  };
} 