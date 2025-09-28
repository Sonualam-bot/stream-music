// URL validation patterns for music streaming platforms

export const URL_PATTERNS = {
  // YouTube URL patterns
  YOUTUBE: {
    // Standard YouTube URLs
    VIDEO: /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/,
    // YouTube Music URLs
    MUSIC: /^https?:\/\/(www\.)?music\.youtube\.com\/watch\?v=[\w-]+/,
    // Playlist URLs
    PLAYLIST:
      /^https?:\/\/(www\.)?(youtube\.com\/playlist\?list=|music\.youtube\.com\/playlist\?list=)[\w-]+/,
    // Channel URLs
    CHANNEL:
      /^https?:\/\/(www\.)?(youtube\.com\/channel\/|youtube\.com\/c\/|youtube\.com\/@)[\w-]+/,
    // General YouTube domain
    DOMAIN: /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|music\.youtube\.com)/,
  },

  // Spotify URL patterns
  SPOTIFY: {
    // Track URLs
    TRACK: /^https?:\/\/open\.spotify\.com\/track\/[\w]+/,
    // Album URLs
    ALBUM: /^https?:\/\/open\.spotify\.com\/album\/[\w]+/,
    // Playlist URLs
    PLAYLIST: /^https?:\/\/open\.spotify\.com\/playlist\/[\w]+/,
    // Artist URLs
    ARTIST: /^https?:\/\/open\.spotify\.com\/artist\/[\w]+/,
    // Episode URLs (for podcasts)
    EPISODE: /^https?:\/\/open\.spotify\.com\/episode\/[\w]+/,
    // Show URLs (for podcasts)
    SHOW: /^https?:\/\/open\.spotify\.com\/show\/[\w]+/,
    // General Spotify domain
    DOMAIN: /^https?:\/\/open\.spotify\.com/,
  },
} as const;

// Validation functions
export const isValidYouTubeUrl = (url: string): boolean => {
  return URL_PATTERNS.YOUTUBE.DOMAIN.test(url);
};

export const isValidSpotifyUrl = (url: string): boolean => {
  return URL_PATTERNS.SPOTIFY.DOMAIN.test(url);
};

export const isValidMusicUrl = (url: string): boolean => {
  return isValidYouTubeUrl(url) || isValidSpotifyUrl(url);
};

// Extract platform type from URL
export const getPlatformFromUrl = (
  url: string
): "YOUTUBE" | "SPOTIFY" | null => {
  if (isValidYouTubeUrl(url)) return "YOUTUBE";
  if (isValidSpotifyUrl(url)) return "SPOTIFY";
  return null;
};

// Extract specific content type
export const getContentType = (url: string): string | null => {
  if (
    URL_PATTERNS.YOUTUBE.VIDEO.test(url) ||
    URL_PATTERNS.YOUTUBE.MUSIC.test(url)
  ) {
    return "VIDEO";
  }
  if (URL_PATTERNS.YOUTUBE.PLAYLIST.test(url)) {
    return "PLAYLIST";
  }
  if (URL_PATTERNS.SPOTIFY.TRACK.test(url)) {
    return "TRACK";
  }
  if (URL_PATTERNS.SPOTIFY.ALBUM.test(url)) {
    return "ALBUM";
  }
  if (URL_PATTERNS.SPOTIFY.PLAYLIST.test(url)) {
    return "PLAYLIST";
  }
  if (URL_PATTERNS.SPOTIFY.ARTIST.test(url)) {
    return "ARTIST";
  }
  return null;
};

// Extract ID from URL
export const extractIdFromUrl = (url: string): string | null => {
  // YouTube video ID extraction
  const youtubeVideoMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/
  );
  if (youtubeVideoMatch) {
    return youtubeVideoMatch[1];
  }

  // YouTube playlist ID extraction
  const youtubePlaylistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (youtubePlaylistMatch) {
    return youtubePlaylistMatch[1];
  }

  // Spotify ID extraction (track, album, playlist, artist, etc.)
  const spotifyMatch = url.match(
    /open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([a-zA-Z0-9]+)/
  );
  if (spotifyMatch) {
    return spotifyMatch[2];
  }

  return null;
};

// Example usage and test cases
export const EXAMPLE_URLS = {
  YOUTUBE: [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://music.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/playlist?list=PLrAXtmRdnEQy6nuLMOV8V4gL7nq5D5x",
    "https://www.youtube.com/channel/UCuAXFkgsw1L7xaCfnd5JJOw",
  ],
  SPOTIFY: [
    "https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh",
    "https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3",
    "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    "https://open.spotify.com/artist/1dfeR4HaWDbWqFHLkxsg1d",
  ],
};
