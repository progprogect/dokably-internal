import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { ChangeEvent, DragEvent } from 'react';
import { ReactComponent as VideoIcon } from '@shared/images/icons/video-play.svg';
import { ReactComponent as UploadIcon } from '@shared/images/icons/upload.svg';

import { parseVideoUrl, getPlatformDisplayName } from '../../utils/videoUrlParser';

interface VideoEmbedUploaderProps {
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (event: DragEvent<HTMLElement>) => void;
  onEmbedSubmit: (embedUrl: string, title?: string) => void;
  blockKey?: string;
}

const VideoEmbedUploader = React.forwardRef<HTMLDivElement, VideoEmbedUploaderProps>(({ 
  onFileUpload, 
  onFileDrop, 
  onEmbedSubmit,
  blockKey 
}, ref) => {
  const [embedUrl, setEmbedUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on input when component mounts (video block created via slash menu)
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50); // 50ms delay for stability, same as CommentsInput
    
    return () => clearTimeout(timer);
  }, []);

  // Prevent focus loss when clicking anywhere in the video uploader container
  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Don't prevent default if clicking on the input itself or buttons
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'BUTTON') {
      return;
    }
    
    // Prevent Draft.js from stealing focus when clicking in the container
    e.preventDefault();
    inputRef.current?.focus();
  };

  const handleEmbedSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedUrl = embedUrl.trim();
    
    if (!trimmedUrl) {
      setErrorMessage('Please enter a video URL');
      return;
    }

    const parsedUrl = parseVideoUrl(trimmedUrl);
    
    if (!parsedUrl.isValid) {
      setErrorMessage('Please enter a valid video URL');
      return;
    }

    if (!parsedUrl.embedUrl) {
      setErrorMessage('This video platform is not supported');
      return;
    }

    // Clear any previous errors
    setErrorMessage('');
    
    // Use the embed URL and platform name as title
    const title = getPlatformDisplayName(parsedUrl.platform);
    onEmbedSubmit(parsedUrl.embedUrl, title);
    setEmbedUrl('');
  };

  // Handle paste event specifically in the input field
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    // Prevent the global editor paste handler from interfering
    e.stopPropagation();
    
    // Get pasted text
    const pastedText = e.clipboardData.getData('text/plain').trim();
    
    if (pastedText) {
      setEmbedUrl(pastedText);
      setErrorMessage(''); // Clear any previous errors
      // Note: No auto-submit, user must click Embed button
    }
  };

  const parsedUrl = parseVideoUrl(embedUrl.trim());
  const hasUrl = embedUrl.trim().length > 0;
  const canEmbed = hasUrl && parsedUrl.isValid;

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Show that drag&drop is available
    e.currentTarget.style.opacity = '0.8';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset opacity after drop
    e.currentTarget.style.opacity = '1';
    onFileDrop(e as DragEvent<HTMLElement>);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Reset opacity when drag leaves
    e.currentTarget.style.opacity = '1';
  };

  // Removed handleClick - file dialog only opens via Upload button

  return (
    <div 
      ref={ref}
      className='w-full'
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      onMouseDown={handleContainerMouseDown}
      style={{
        background: '#F7F7F8',
        borderRadius: '4px',
        height: '96px' // Increased by 50% (64px -> 96px)
      }}
    >
      {/* Hidden file input with unique ID */}
      <input
        type="file"
        id={`video-file-input-${blockKey || 'default'}`}
        accept="video/*"
        onChange={onFileUpload}
        className="hidden"
      />
      
      <div className='flex items-center gap-3 px-3 h-full'>
        {/* URL Input */}
        <form onSubmit={handleEmbedSubmit} className='flex-1'>
          <input
            ref={inputRef}
            type='text'
            value={embedUrl}
            onChange={(e) => {
              setEmbedUrl(e.target.value);
              setErrorMessage(''); // Clear error when user types
            }}
            onPaste={handlePaste}
            onFocus={() => {
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsInputFocused(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
              // If it's a valid video URL, open it in new tab
              if (canEmbed && embedUrl.trim()) {
                window.open(embedUrl.trim(), '_blank');
              }
            }}
            placeholder='Paste link here'
            className={`w-full px-3 py-2 bg-transparent border-none outline-none focus:outline-none ${
              canEmbed ? 'cursor-pointer hover:underline' : ''
            }`}
            style={{ 
              fontSize: '14px',
              color: canEmbed ? '#2554F6' : '#949395'
            }}
          />
          
          {/* Error message */}
          {/* No status messages - input shows URL as clickable link */}
        </form>

        {/* Actions */}
        <div className='flex gap-2 flex-shrink-0'>
                      <button
              type='button'
              onClick={(e) => {
                e.stopPropagation();
                handleEmbedSubmit(e);
              }}
              disabled={!canEmbed}
              className={`px-3 py-2 font-medium transition-colors ${
                canEmbed
                  ? 'cursor-pointer hover:opacity-70'
                  : 'cursor-not-allowed'
              }`}
              style={{ 
                fontSize: '14px',
                color: canEmbed ? '#3E3E41' : '#949395'
              }}
            >
              Embed
            </button>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById(`video-file-input-${blockKey || 'default'}`)?.click();
            }}
            className='px-3 py-2 font-medium hover:opacity-70 transition-colors flex items-center gap-1'
            style={{ 
              fontSize: '14px',
              color: '#3E3E41'
            }}
          >
            Upload
            <UploadIcon className='w-3 h-3' />
          </button>
        </div>
      </div>
    </div>
  );
});

VideoEmbedUploader.displayName = 'VideoEmbedUploader';

export default VideoEmbedUploader;
