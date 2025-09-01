/**
 * Utility functions for parsing and converting video URLs to embeddable format
 */

export interface ParsedVideoUrl {
  platform: 'youtube' | 'vimeo' | 'unknown';
  videoId: string | null;
  embedUrl: string | null;
  originalUrl: string;
  isValid: boolean;
}

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    // youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // m.youtube.com/watch?v=ID
    /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extracts Vimeo video ID from various Vimeo URL formats
 */
export function extractVimeoVideoId(url: string): string | null {
  const patterns = [
    // vimeo.com/ID
    /(?:vimeo\.com\/)(\d+)/,
    // player.vimeo.com/video/ID
    /(?:player\.vimeo\.com\/video\/)(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Converts YouTube video ID to embed URL
 */
export function youtubeIdToEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

/**
 * Converts Vimeo video ID to embed URL
 */
export function vimeoIdToEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Parses video URL and returns structured information
 */
export function parseVideoUrl(url: string): ParsedVideoUrl {
  if (!url || typeof url !== 'string') {
    return {
      platform: 'unknown',
      videoId: null,
      embedUrl: null,
      originalUrl: url || '',
      isValid: false,
    };
  }

  const normalizedUrl = url.toLowerCase().trim();

  // Check for YouTube
  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      return {
        platform: 'youtube',
        videoId,
        embedUrl: youtubeIdToEmbedUrl(videoId),
        originalUrl: url,
        isValid: true,
      };
    }
  }

  // Check for Vimeo
  if (normalizedUrl.includes('vimeo.com')) {
    const videoId = extractVimeoVideoId(url);
    if (videoId) {
      return {
        platform: 'vimeo',
        videoId,
        embedUrl: vimeoIdToEmbedUrl(videoId),
        originalUrl: url,
        isValid: true,
      };
    }
  }

  // If no supported platform found, return invalid result
  return {
    platform: 'unknown',
    videoId: null,
    embedUrl: null,
    originalUrl: url,
    isValid: false, // Only YouTube and Vimeo are valid for embedding
  };
}

/**
 * Checks if URL is from a supported video platform
 */
export function isSupportedVideoPlatform(url: string): boolean {
  const parsed = parseVideoUrl(url);
  return parsed.platform !== 'unknown' && parsed.isValid;
}

/**
 * Gets display name for video platform
 */
export function getPlatformDisplayName(platform: string): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'vimeo':
      return 'Vimeo';
    default:
      return 'Video';
  }
}
