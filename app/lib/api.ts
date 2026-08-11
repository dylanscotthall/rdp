// ── Types ──────────────────────────────────────────────────────────────────────

export interface Location {
  id: number;
  name: string;
  country: string;
  latitude: string;
  longitude: string;
}

export interface ImageRecord {
  id: string;
  fileUrl: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  locationId: number | null;
  location: Location | null;
}

export interface VideoRecord {
  id: string;
  fileUrl: string;
  caption: string | null;
  duration: number | null;
  locationId: number | null;
  location: Location | null;
}

export interface Theme {
  id: number;
  name: string;
  coverImageId: string | null;
  coverImage: ImageRecord | null;
  coverVideoId: string | null;
  coverVideo: VideoRecord | null;
}

export interface FeaturedItem {
  type: "image" | "video";
  id: string;
  fileUrl: string;
  caption: string | null;
  width?: number | null;
  height?: number | null;
  featured: boolean;
  featuredOrder: number | null;
  featuredLarge: boolean;
}
export interface LocationMediaItem {
  type: "image" | "video";
  id: string;
  fileUrl: string;
  caption: string | null;
  locationId: number | null;
}

// ── Internal helpers ───────────────────────────────────────────────────────────

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function postJson(body: unknown) {
  return {
    method: "POST" as const,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function patchJson(body: unknown) {
  return {
    method: "PATCH" as const,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function deleteJson(body: unknown) {
  return {
    method: "DELETE" as const,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ── API ────────────────────────────────────────────────────────────────────────

export const api = {
  // Themes
  fetchThemes: () => fetch("/api/themes").then((r) => handle<Theme[]>(r)),

  createTheme: (name: string) =>
    fetch("/api/themes", postJson({ name })).then((r) => handle<Theme>(r)),

  deleteTheme: (id: number) =>
    fetch(`/api/themes/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ success: true }>(r),
    ),

  // Theme images
  fetchThemeImages: (themeId: number) =>
    fetch(`/api/themes/${themeId}/images`).then((r) =>
      handle<ImageRecord[]>(r),
    ),

  addImageToTheme: (themeId: number, imageId: string) =>
    fetch(`/api/themes/${themeId}/images`, postJson({ imageId })).then((r) =>
      handle<{ themeId: number; imageId: string }>(r),
    ),

  removeImageFromTheme: (themeId: number, imageId: string) =>
    fetch(`/api/themes/${themeId}/images`, deleteJson({ imageId })).then((r) =>
      handle<{ success: true }>(r),
    ),

  setCoverImage: (themeId: number, imageId: string) =>
    fetch(`/api/themes/${themeId}/cover`, postJson({ imageId })).then((r) =>
      handle<Theme>(r),
    ),

  // Theme videos
  fetchThemeVideos: (themeId: number) =>
    fetch(`/api/themes/${themeId}/videos`).then((r) =>
      handle<VideoRecord[]>(r),
    ),

  addVideoToTheme: (themeId: number, videoId: string) =>
    fetch(`/api/themes/${themeId}/videos`, postJson({ videoId })).then((r) =>
      handle<{ themeId: number; videoId: string }>(r),
    ),

  removeVideoFromTheme: (themeId: number, videoId: string) =>
    fetch(`/api/themes/${themeId}/videos`, deleteJson({ videoId })).then((r) =>
      handle<{ success: true }>(r),
    ),

  setCoverVideo: (themeId: number, videoId: string) =>
    fetch(`/api/themes/${themeId}/cover-video`, postJson({ videoId })).then(
      (r) => handle<Theme>(r),
    ),

  // Images
  createImage: (fileUrl: string) =>
    fetch("/api/images", postJson({ fileUrl })).then((r) =>
      handle<ImageRecord>(r),
    ),

  updateImage: (
    id: string,
    data: {
      caption?: string;
      locationId?: number | null;
      featured?: boolean;
      featuredOrder?: number | null;
      featuredLarge?: boolean;
    },
  ) =>
    fetch(`/api/images/${id}`, patchJson(data)).then((r) =>
      handle<ImageRecord>(r),
    ),

  deleteImage: (id: string) =>
    fetch(`/api/images/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ success: true }>(r),
    ),

  // Videos
  createVideo: (fileUrl: string) =>
    fetch("/api/videos", postJson({ fileUrl })).then((r) =>
      handle<VideoRecord>(r),
    ),

  updateVideo: (
    id: string,
    data: {
      caption?: string;
      locationId?: number | null;
      featured?: boolean;
      featuredOrder?: number | null;
      featuredLarge?: boolean;
    },
  ) =>
    fetch(`/api/videos/${id}`, patchJson(data)).then((r) =>
      handle<VideoRecord>(r),
    ),

  deleteVideo: (id: string) =>
    fetch(`/api/videos/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ success: true }>(r),
    ),

  // Locations
  fetchLocations: () =>
    fetch("/api/locations").then((r) => handle<Location[]>(r)),

  createLocation: (data: {
    name: string;
    country: string;
    latitude: string;
    longitude: string;
  }) =>
    fetch("/api/locations", postJson(data)).then((r) => handle<Location>(r)),

  deleteLocation: (id: number) =>
    fetch(`/api/locations/${id}`, { method: "DELETE" }).then((r) =>
      handle<{ success: true }>(r),
    ),

  // Featured
  fetchFeatured: () =>
    fetch("/api/featured").then((r) => handle<FeaturedItem[]>(r)),

  reorderFeatured: (items: { id: string; type: "image" | "video" }[]) =>
    fetch("/api/featured/reorder", postJson({ items })).then((r) =>
      handle<{ ok: true }>(r),
    ),

  // R2 file listing
  listR2Files: (folder: string) =>
    fetch(`/api/r2/list?folder=${encodeURIComponent(folder)}`).then((r) =>
      handle<{ files: string[] }>(r),
    ),

  fetchAllImages: () =>
    fetch("/api/images").then((r) => handle<ImageRecord[]>(r)),
  fetchAllVideos: () =>
    fetch("/api/videos").then((r) => handle<VideoRecord[]>(r)),
  fetchLocationMedia: (locationId: number) =>
    fetch(`/api/locations/${locationId}/media`).then((r) =>
      handle<LocationMediaItem[]>(r),
    ),
};
