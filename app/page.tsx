"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { api, type FeaturedItem } from "@/app/lib/api";
import styles from "./page.module.css";

export default function Home() {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .fetchFeatured()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const active = activeIndex !== null ? items[activeIndex] : null;

  const close = () => setActiveIndex(null);
  const prev = () =>
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + items.length) % items.length,
    );
  const next = () =>
    setActiveIndex((i) => (i === null ? null : (i + 1) % items.length));

  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, items.length]);

  return (
    <div className={styles.page}>
      {loading ? (
        <p className={styles.muted}>Loading...</p>
      ) : items.length === 0 ? (
        <p className={styles.muted}>No featured work yet.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item, index) => (
            <Tile
              key={`${item.type}-${item.id}`}
              item={item}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}

      {active && (
        <div className={styles.lightbox} onClick={close}>
          <button
            className={styles.closeBtn}
            onClick={close}
            aria-label="Close"
          >
            ✕
          </button>
          {items.length > 1 && (
            <>
              <button
                className={`${styles.navBtn} ${styles.navBtnLeft}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
              >
                ‹
              </button>
              <button
                className={`${styles.navBtn} ${styles.navBtnRight}`}
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
              >
                ›
              </button>
            </>
          )}
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            {active.type === "image" ? (
              <div className={styles.lightboxImageWrap}>
                <Image
                  src={active.fileUrl}
                  alt={active.caption ?? ""}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "contain" }}
                  priority
                />
              </div>
            ) : (
              <video
                key={active.fileUrl}
                src={active.fileUrl}
                controls
                autoPlay
                className={styles.lightboxVideo}
              />
            )}
            {active.caption && (
              <div className={styles.lightboxInfo}>{active.caption}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tile — handles its own viewport-triggered video autoplay ──────────────────

function Tile({ item, onClick }: { item: FeaturedItem; onClick: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (item.type !== "video" || !videoRef.current || !containerRef.current)
      return;

    const video = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            // Autoplay can be blocked in some browsers even when muted —
            // safe to ignore, video just stays paused until clicked.
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.5 }, // video must be at least 50% visible to play
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [item.type]);

  return (
    <button
      ref={containerRef}
      className={`${styles.tile} ${item.featuredLarge ? styles.tileLarge : ""}`}
      onClick={onClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {item.type === "image" ? (
        <Image
          src={item.fileUrl}
          alt={item.caption ?? ""}
          fill
          sizes={
            item.featuredLarge
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className={styles.tileMedia}
        />
      ) : (
        <video
          ref={videoRef}
          src={item.fileUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className={styles.tileMedia}
        />
      )}
      <div className={styles.tileOverlay} />
      {item.type === "video" && <div className={styles.playIcon}>▶</div>}
      {item.caption && (
        <span className={styles.tileCaption}>{item.caption}</span>
      )}
    </button>
  );
}
