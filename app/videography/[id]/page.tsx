"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api, type Theme, type VideoRecord } from "@/app/lib/api";
import styles from "./theme.module.css";

export default function VideoThemeGalleryPage() {
  const { id } = useParams<{ id: string }>();

  const [theme, setTheme] = useState<Theme | null>(null);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [themes, themeVideos] = await Promise.all([
        api.fetchThemes(),
        api.fetchThemeVideos(Number(id)),
      ]);
      setTheme(themes.find((t) => t.id === Number(id)) ?? null);
      setVideos(themeVideos);
      setLoading(false);
    };
    load();
  }, [id]);

  const closeViewer = useCallback(() => setActiveIndex(null), []);
  const prevVideo = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + videos.length) % videos.length,
    );
  }, [videos.length]);
  const nextVideo = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % videos.length));
  }, [videos.length]);

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") prevVideo();
      if (e.key === "ArrowRight") nextVideo();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, closeViewer, prevVideo, nextVideo]);

  if (loading)
    return (
      <div className={styles.page}>
        {" "}
        <p className={styles.muted}>Loading...</p>
      </div>
    );

  if (!theme) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Theme not found.</p>
        <Link href="/videography" className={styles.backLink}>
          ← Back to Videography
        </Link>
      </div>
    );
  }

  const active = activeIndex !== null ? videos[activeIndex] : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{theme.name}</h1>
        <p className={styles.count}>
          {videos.length} {videos.length === 1 ? "video" : "videos"}
        </p>
      </header>

      {videos.length === 0 ? (
        <p className={styles.muted}>No videos in this theme yet.</p>
      ) : (
        <div className={styles.grid}>
          {videos.map((vid, index) => (
            <button
              key={vid.id}
              className={styles.tile}
              onClick={() => setActiveIndex(index)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <video
                src={vid.fileUrl}
                muted
                loop
                playsInline
                preload="metadata"
                className={styles.tileVideo}
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => {
                  e.currentTarget.pause();
                  e.currentTarget.currentTime = 0;
                }}
              />
              <div className={styles.tileOverlay} />
              <div className={styles.tilePlayIcon}>▶</div>
              {vid.caption && (
                <span className={styles.tileCaption}>{vid.caption}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className={styles.lightbox} onClick={closeViewer}>
          <button
            className={styles.closeBtn}
            onClick={closeViewer}
            aria-label="Close"
          >
            ✕
          </button>

          {videos.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.navBtnLeft}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prevVideo();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnRight}`}
                onClick={(e) => {
                  e.stopPropagation();
                  nextVideo();
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}

          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              key={active.fileUrl}
              src={active.fileUrl}
              controls
              autoPlay
              className={styles.lightboxVideo}
            />

            {(active.caption || active.location) && (
              <div className={styles.lightboxInfo}>
                {active.caption && <span>{active.caption}</span>}
                {active.location && (
                  <span className={styles.lightboxLocation}>
                    📍 {active.location.name}, {active.location.country}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
