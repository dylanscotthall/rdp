"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  api,
  type Theme,
  type ImageRecord,
  type VideoRecord,
  type Location,
} from "@/app/lib/api";
import styles from "./admin.module.css";

type AdminTab = "themes" | "locations" | "featured";
type MediaTab = "images" | "videos";
type FeaturedItem = (ImageRecord | VideoRecord) & {
  type: "image" | "video";
  featured: boolean;
  featuredOrder: number | null;
  featuredLarge: boolean;
};

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("themes");

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    window.location.href = "/";
  };

  return (
    <div className={styles.page}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "themes" ? styles.activeTab : ""}`}
          onClick={() => setTab("themes")}
        >
          Themes
        </button>
        <button
          className={`${styles.tab} ${tab === "locations" ? styles.activeTab : ""}`}
          onClick={() => setTab("locations")}
        >
          Locations
        </button>
        <button
          className={`${styles.tab} ${tab === "featured" ? styles.activeTab : ""}`}
          onClick={() => setTab("featured")}
        >
          Featured
        </button>
        <button
          className={styles.btnDanger}
          style={{ marginLeft: "auto" }}
          onClick={logout}
        >
          Logout
        </button>
      </div>

      {tab === "themes" && <ThemesPanel />}
      {tab === "locations" && <LocationsPanel />}
      {tab === "featured" && <FeaturedPanel />}
    </div>
  );
}

// ── Themes Panel ───────────────────────────────────────────────────────────────

function ThemesPanel() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [newThemeName, setNewThemeName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [mediaTab, setMediaTab] = useState<MediaTab>("images");

  const loadThemes = useCallback(async () => {
    setThemes(await api.fetchThemes());
  }, []);

  const loadLocations = useCallback(async () => {
    setLocations(await api.fetchLocations());
  }, []);

  useEffect(() => {
    loadThemes();
    loadLocations();
  }, [loadThemes, loadLocations]);

  const createTheme = async () => {
    if (!newThemeName.trim()) return;
    await api.createTheme(newThemeName.trim());
    setNewThemeName("");
    await loadThemes();
  };

  const deleteTheme = async (id: number) => {
    if (!confirm("Delete this theme? Media will not be deleted.")) return;
    await api.deleteTheme(id);
    if (selectedTheme?.id === id) setSelectedTheme(null);
    await loadThemes();
  };

  const selectTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setMediaTab("images");
  };

  return (
    <div className={styles.panelGrid}>
      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Themes</h2>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            placeholder="New theme name"
            onKeyDown={(e) => e.key === "Enter" && createTheme()}
          />
          <button className={styles.btn} onClick={createTheme}>
            Add
          </button>
        </div>
        <ul className={styles.list}>
          {themes.map((theme) => (
            <li
              key={theme.id}
              className={`${styles.listItem} ${selectedTheme?.id === theme.id ? styles.selected : ""}`}
              onClick={() => selectTheme(theme)}
            >
              <div className={styles.listItemContent}>
                {(theme.coverImage || theme.coverVideo) && (
                  <div className={styles.themeThumbnail}>
                    {theme.coverImage ? (
                      <Image
                        src={theme.coverImage.fileUrl}
                        alt=""
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <video
                        src={theme.coverVideo!.fileUrl}
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    )}
                  </div>
                )}
                <span>{theme.name}</span>
              </div>
              <button
                className={styles.btnDanger}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTheme(theme.id);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedTheme && (
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>{selectedTheme.name}</h2>
          <div className={styles.mediaTabs}>
            <button
              className={`${styles.mediaTab} ${mediaTab === "images" ? styles.activeMediaTab : ""}`}
              onClick={() => setMediaTab("images")}
            >
              Images
            </button>
            <button
              className={`${styles.mediaTab} ${mediaTab === "videos" ? styles.activeMediaTab : ""}`}
              onClick={() => setMediaTab("videos")}
            >
              Videos
            </button>
          </div>
          {mediaTab === "images" ? (
            <ThemeImagesEditor
              theme={selectedTheme}
              locations={locations}
              onThemeUpdated={(t) => {
                setSelectedTheme(t);
                loadThemes();
              }}
            />
          ) : (
            <ThemeVideosEditor
              theme={selectedTheme}
              locations={locations}
              onThemeUpdated={(t) => {
                setSelectedTheme(t);
                loadThemes();
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Images editor for a theme ────────────────────────────────────────────────

function ThemeImagesEditor({
  theme,
  locations,
  onThemeUpdated,
}: {
  theme: Theme;
  locations: Location[];
  onThemeUpdated: (theme: Theme) => void;
}) {
  const [themeImages, setThemeImages] = useState<ImageRecord[]>([]);
  const [r2Files, setR2Files] = useState<string[]>([]);
  const [r2Page, setR2Page] = useState(0);
  const [r2Loading, setR2Loading] = useState(true);
  const PAGE_SIZE = 24;

  const loadThemeImages = useCallback(async () => {
    setThemeImages(await api.fetchThemeImages(theme.id));
  }, [theme.id]);

  useEffect(() => {
    setR2Loading(true);
    loadThemeImages();
    api.listR2Files("photos/web/").then(({ files }) => {
      setR2Files(files);
      setR2Loading(false);
    });
  }, [theme.id, loadThemeImages]);

  const addImage = async (fileUrl: string) => {
    if (themeImages.some((img) => img.fileUrl === fileUrl)) return;
    const newImage = await api.createImage(fileUrl);
    await api.addImageToTheme(theme.id, newImage.id);
    await loadThemeImages();
  };

  const removeImage = async (imageId: string) => {
    await api.removeImageFromTheme(theme.id, imageId);
    await loadThemeImages();
  };

  const setCover = async (imageId: string) => {
    const updated = await api.setCoverImage(theme.id, imageId);
    onThemeUpdated(updated);
  };

  const updateCaption = async (imageId: string, caption: string) => {
    await api.updateImage(imageId, { caption });
    await loadThemeImages();
  };

  const updateLocation = async (imageId: string, locationId: number | null) => {
    await api.updateImage(imageId, { locationId });
    await loadThemeImages();
  };

  const pagedFiles = r2Files.slice(
    r2Page * PAGE_SIZE,
    (r2Page + 1) * PAGE_SIZE,
  );
  const totalPages = Math.ceil(r2Files.length / PAGE_SIZE);

  return (
    <>
      <h3 className={styles.sectionTitle}>Images in theme</h3>
      {themeImages.length === 0 ? (
        <p className={styles.muted}>No images yet. Pick from R2 below.</p>
      ) : (
        <div className={styles.imageGrid}>
          {themeImages.map((img) => (
            <div key={img.id} className={styles.imageCard}>
              <div className={styles.imageCardThumb}>
                <Image
                  src={img.fileUrl}
                  alt=""
                  fill
                  style={{ objectFit: "cover" }}
                />
                {theme.coverImageId === img.id && (
                  <span className={styles.coverBadge}>Cover</span>
                )}
              </div>
              <input
                className={styles.inputSm}
                defaultValue={img.caption ?? ""}
                placeholder="Caption..."
                onBlur={(e) => updateCaption(img.id, e.target.value)}
              />
              <select
                className={styles.inputSm}
                value={img.locationId ?? ""}
                onChange={(e) =>
                  updateLocation(
                    img.id,
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">No location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}, {loc.country}
                  </option>
                ))}
              </select>
              <div className={styles.imageCardActions}>
                <button
                  className={styles.btnSm}
                  onClick={() => setCover(img.id)}
                  disabled={theme.coverImageId === img.id}
                >
                  Set cover
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={() => removeImage(img.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>
        Add from R2 ({r2Files.length} files)
      </h3>
      {r2Loading ? (
        <p className={styles.muted}>Loading R2 files...</p>
      ) : (
        <>
          <div className={styles.imageGrid}>
            {pagedFiles.map((url) => {
              const inTheme = themeImages.some((img) => img.fileUrl === url);
              return (
                <div
                  key={url}
                  className={`${styles.r2Thumb} ${inTheme ? styles.r2ThumbInTheme : ""}`}
                  onClick={() => !inTheme && addImage(url)}
                  title={inTheme ? "Already in theme" : "Click to add"}
                >
                  <Image src={url} alt="" fill style={{ objectFit: "cover" }} />
                  {inTheme && <div className={styles.r2ThumbOverlay}>✓</div>}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.btnSm}
                onClick={() => setR2Page((p) => Math.max(0, p - 1))}
                disabled={r2Page === 0}
              >
                ← Prev
              </button>
              <span className={styles.muted}>
                {r2Page + 1} / {totalPages}
              </span>
              <button
                className={styles.btnSm}
                onClick={() =>
                  setR2Page((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={r2Page === totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Videos editor for a theme ────────────────────────────────────────────────

function ThemeVideosEditor({
  theme,
  locations,
  onThemeUpdated,
}: {
  theme: Theme;
  locations: Location[];
  onThemeUpdated: (theme: Theme) => void;
}) {
  const [themeVideos, setThemeVideos] = useState<VideoRecord[]>([]);
  const [r2Files, setR2Files] = useState<string[]>([]);
  const [r2Page, setR2Page] = useState(0);
  const [r2Loading, setR2Loading] = useState(true);
  const PAGE_SIZE = 12;

  const loadThemeVideos = useCallback(async () => {
    setThemeVideos(await api.fetchThemeVideos(theme.id));
  }, [theme.id]);

  useEffect(() => {
    setR2Loading(true);
    loadThemeVideos();
    api.listR2Files("videos/web/").then(({ files }) => {
      setR2Files(files);
      setR2Loading(false);
    });
  }, [theme.id, loadThemeVideos]);

  const addVideo = async (fileUrl: string) => {
    if (themeVideos.some((v) => v.fileUrl === fileUrl)) return;
    const newVideo = await api.createVideo(fileUrl);
    await api.addVideoToTheme(theme.id, newVideo.id);
    await loadThemeVideos();
  };

  const removeVideo = async (videoId: string) => {
    await api.removeVideoFromTheme(theme.id, videoId);
    await loadThemeVideos();
  };

  const setCover = async (videoId: string) => {
    const updated = await api.setCoverVideo(theme.id, videoId);
    onThemeUpdated(updated);
  };

  const updateCaption = async (videoId: string, caption: string) => {
    await api.updateVideo(videoId, { caption });
    await loadThemeVideos();
  };

  const updateLocation = async (videoId: string, locationId: number | null) => {
    await api.updateVideo(videoId, { locationId });
    await loadThemeVideos();
  };

  const pagedFiles = r2Files.slice(
    r2Page * PAGE_SIZE,
    (r2Page + 1) * PAGE_SIZE,
  );
  const totalPages = Math.ceil(r2Files.length / PAGE_SIZE);

  return (
    <>
      <h3 className={styles.sectionTitle}>Videos in theme</h3>
      {themeVideos.length === 0 ? (
        <p className={styles.muted}>No videos yet. Pick from R2 below.</p>
      ) : (
        <div className={styles.videoGrid}>
          {themeVideos.map((vid) => (
            <div key={vid.id} className={styles.imageCard}>
              <div className={styles.imageCardThumb}>
                <video
                  src={vid.fileUrl}
                  muted
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {theme.coverVideoId === vid.id && (
                  <span className={styles.coverBadge}>Cover</span>
                )}
              </div>
              <input
                className={styles.inputSm}
                defaultValue={vid.caption ?? ""}
                placeholder="Caption..."
                onBlur={(e) => updateCaption(vid.id, e.target.value)}
              />
              <select
                className={styles.inputSm}
                value={vid.locationId ?? ""}
                onChange={(e) =>
                  updateLocation(
                    vid.id,
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
              >
                <option value="">No location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}, {loc.country}
                  </option>
                ))}
              </select>
              <div className={styles.imageCardActions}>
                <button
                  className={styles.btnSm}
                  onClick={() => setCover(vid.id)}
                  disabled={theme.coverVideoId === vid.id}
                >
                  Set cover
                </button>
                <button
                  className={styles.btnDanger}
                  onClick={() => removeVideo(vid.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h3 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>
        Add from R2 ({r2Files.length} files)
      </h3>
      {r2Loading ? (
        <p className={styles.muted}>Loading R2 files...</p>
      ) : (
        <>
          <div className={styles.videoGrid}>
            {pagedFiles.map((url) => {
              const inTheme = themeVideos.some((v) => v.fileUrl === url);
              return (
                <div
                  key={url}
                  className={`${styles.r2Thumb} ${inTheme ? styles.r2ThumbInTheme : ""}`}
                  onClick={() => !inTheme && addVideo(url)}
                  title={inTheme ? "Already in theme" : "Click to add"}
                >
                  <video
                    src={url}
                    muted
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {inTheme && <div className={styles.r2ThumbOverlay}>✓</div>}
                </div>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.btnSm}
                onClick={() => setR2Page((p) => Math.max(0, p - 1))}
                disabled={r2Page === 0}
              >
                ← Prev
              </button>
              <span className={styles.muted}>
                {r2Page + 1} / {totalPages}
              </span>
              <button
                className={styles.btnSm}
                onClick={() =>
                  setR2Page((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={r2Page === totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}

// ── Locations Panel ────────────────────────────────────────────────────────────

function LocationsPanel() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [form, setForm] = useState({
    name: "",
    country: "",
    latitude: "",
    longitude: "",
  });

  const load = useCallback(async () => {
    setLocations(await api.fetchLocations());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.name || !form.latitude || !form.longitude) return;
    await api.createLocation(form);
    setForm({ name: "", country: "", latitude: "", longitude: "" });
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this location? Media will be unlinked.")) return;
    await api.deleteLocation(id);
    await load();
  };

  return (
    <div className={styles.panel} style={{ maxWidth: "600px" }}>
      <h2 className={styles.panelTitle}>Locations</h2>
      <div className={styles.formGrid}>
        <input
          className={styles.input}
          placeholder="Name (e.g. Aliwal Shoal)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Country"
          value={form.country}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Latitude (e.g. -30.2960)"
          value={form.latitude}
          onChange={(e) => setForm({ ...form, latitude: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Longitude (e.g. 30.8653)"
          value={form.longitude}
          onChange={(e) => setForm({ ...form, longitude: e.target.value })}
        />
        <button className={styles.btn} onClick={create}>
          Add Location
        </button>
      </div>
      <ul className={styles.list} style={{ marginTop: "1.5rem" }}>
        {locations.map((loc) => (
          <li key={loc.id} className={styles.listItem}>
            <div>
              <strong>{loc.name}</strong>
              {loc.country && (
                <span className={styles.muted}> — {loc.country}</span>
              )}
              <br />
              <span className={styles.muted}>
                {loc.latitude}, {loc.longitude}
              </span>
            </div>
            <button className={styles.btnDanger} onClick={() => remove(loc.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Sortable featured card ─────────────────────────────────────────────────────

function SortableFeaturedCard({
  item,
  index,
  onToggleFeatured,
  onToggleLarge,
}: {
  item: FeaturedItem;
  index: number;
  onToggleFeatured: () => void;
  onToggleLarge: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${item.type}-${item.id}` });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${styles.featuredCard} ${isDragging ? styles.featuredCardDragging : ""}`}
    >
      <div className={styles.featuredThumb}>
        {item.type === "image" ? (
          <Image
            src={item.fileUrl}
            alt=""
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <video
            src={item.fileUrl}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* Position badge */}
        <span className={styles.orderBadge}>#{index + 1}</span>

        {/* Type badge */}
        <span className={styles.typeBadge}>
          {item.type === "image" ? "img" : "vid"}
        </span>

        {/* Large badge — only when active */}
        {item.featuredLarge && <span className={styles.largeBadge}>LARGE</span>}

        {/* Hover overlay with actions */}
        <div className={styles.featuredOverlay}>
          <button
            className={`${styles.overlayBtn} ${styles.overlayBtnDanger}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleFeatured}
          >
            Unfeature
          </button>
          <button
            className={styles.overlayBtn}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleLarge}
          >
            {item.featuredLarge ? "Remove large" : "Make large"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Featured Panel ─────────────────────────────────────────────────────────────

function FeaturedPanel() {
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [unfeaturedItems, setUnfeaturedItems] = useState<FeaturedItem[]>([]);
  const [mediaFilter, setMediaFilter] = useState<"all" | "images" | "videos">(
    "all",
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const load = useCallback(async () => {
    const [imgs, vids] = await Promise.all([
      api.fetchAllImages(),
      api.fetchAllVideos(),
    ]);

    const combined: FeaturedItem[] = [
      ...(imgs as any[]).map((img) => ({ ...img, type: "image" as const })),
      ...(vids as any[]).map((vid) => ({ ...vid, type: "video" as const })),
    ];

    setFeaturedItems(
      combined
        .filter((i) => i.featured)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0)),
    );
    setUnfeaturedItems(combined.filter((i) => !i.featured));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = featuredItems.findIndex(
      (i) => `${i.type}-${i.id}` === active.id,
    );
    const newIndex = featuredItems.findIndex(
      (i) => `${i.type}-${i.id}` === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(featuredItems, oldIndex, newIndex);
    setFeaturedItems(reordered);
    await api.reorderFeatured(
      reordered.map((i) => ({ id: i.id, type: i.type })),
    );
  };

  const toggleFeatured = async (item: FeaturedItem) => {
    const nowFeatured = !item.featured;
    const payload = {
      featured: nowFeatured,
      featuredOrder: nowFeatured ? featuredItems.length : null,
    };
    if (item.type === "image") await api.updateImage(item.id, payload);
    else await api.updateVideo(item.id, payload);
    await load();
  };

  const toggleLarge = async (item: FeaturedItem) => {
    if (item.type === "image")
      await api.updateImage(item.id, { featuredLarge: !item.featuredLarge });
    else await api.updateVideo(item.id, { featuredLarge: !item.featuredLarge });
    await load();
  };

  const filteredFeatured = featuredItems.filter((i) => {
    if (mediaFilter === "images") return i.type === "image";
    if (mediaFilter === "videos") return i.type === "video";
    return true;
  });

  const filteredUnfeatured = unfeaturedItems.filter((i) => {
    if (mediaFilter === "images") return i.type === "image";
    if (mediaFilter === "videos") return i.type === "video";
    return true;
  });

  return (
    <div className={styles.panel}>
      <h2 className={styles.panelTitle}>
        Featured ({featuredItems.length} on homepage)
      </h2>

      <div className={styles.mediaTabs}>
        {(["all", "images", "videos"] as const).map((f) => (
          <button
            key={f}
            className={`${styles.mediaTab} ${mediaFilter === f ? styles.activeMediaTab : ""}`}
            onClick={() => setMediaFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filteredFeatured.length > 0 && (
        <>
          <h3 className={styles.sectionTitle}>Featured — drag to reorder</h3>
          <p className={styles.dragHint}>
            Hover a card to unfeature or toggle large
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredFeatured.map((i) => `${i.type}-${i.id}`)}
              strategy={rectSortingStrategy}
            >
              <div className={styles.featuredGrid}>
                {filteredFeatured.map((item, idx) => (
                  <SortableFeaturedCard
                    key={`${item.type}-${item.id}`}
                    item={item}
                    index={idx}
                    onToggleFeatured={() => toggleFeatured(item)}
                    onToggleLarge={() => toggleLarge(item)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {filteredUnfeatured.length > 0 && (
        <>
          <h3 className={styles.sectionTitle} style={{ marginTop: "2rem" }}>
            Not featured — hover to add
          </h3>
          <div className={styles.unfeaturedGrid}>
            {filteredUnfeatured.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className={styles.unfeaturedCard}
              >
                <div className={styles.unfeaturedThumb}>
                  {item.type === "image" ? (
                    <Image
                      src={item.fileUrl}
                      alt=""
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <video
                      src={item.fileUrl}
                      muted
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div className={styles.unfeaturedOverlay}>
                    <button
                      className={styles.overlayBtn}
                      onClick={() => toggleFeatured(item)}
                    >
                      Feature
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
