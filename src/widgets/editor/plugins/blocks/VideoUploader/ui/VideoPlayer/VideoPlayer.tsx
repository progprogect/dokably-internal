import React, { useState, useRef } from 'react';
import cn from 'classnames';

interface VideoPlayerProps {
  src: string;
  title?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onRetry?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title = 'Video',
  width = '100%',
  height = 'auto',
  className,
  style,
  onError,
  onRetry
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
    onRetry?.();
  };

  if (hasError) {
    return (
      <div 
        className={cn(
          'flex flex-col items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6',
          className
        )}
        style={{ width, height: height === 'auto' ? '200px' : height }}
      >
        <div className="text-4xl mb-4 opacity-60">🎥</div>
        <div className="text-gray-600 text-center mb-4">
          <div className="font-medium">Failed to load video</div>
          <div className="text-sm text-gray-500 mt-1">{title}</div>
        </div>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={style}>
      {isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg"
          style={{ width, height: height === 'auto' ? '200px' : height }}
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <div className="text-sm text-gray-600">Loading video...</div>
          </div>
        </div>
      )}
      <video
        ref={videoRef}
        src={src}
        controls
        width={width}
        height={height}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        className={cn('rounded-lg shadow-sm', { 'opacity-0': isLoading })}
        preload="metadata"
      >
        <track kind="captions" />
        Your browser does not support the video tag.
      </video>
      {title && !isLoading && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {title}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
