"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./theme.module.css";

interface ImageRecord {
  id: string;
  fileUrl: string;
  caption: string | null;
  location: { id: number; name: string; country: string } | null;
}

interface Theme {
  id: number;
  name: string;
}

export default function ThemeGalleryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [theme, setTheme] = useState<Theme | null>(null);
  const [images, setImages] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const [themesRes, imagesRes] = await Promise.all([
        fetch("/api/themes").then((r) => r.json()),
        fetch(`/api/themes/${id}/images`).then((r) => r.json()),
      ]);
      const found = themesRes.find((t: Theme) => t.id === Number(id));
      setTheme(found ?? null);
      setImages(imagesRes);
      setLoading(false);
    };
    load();
  }, [id]);

  const closeViewer = useCallback(() => setActiveIndex(null), []);
  const prevImage = useCallback(() => {
    setActiveIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    );
  }, [images.length]);
  const nextImage = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  // Keyboard nav for fullscreen viewer
  useEffect(() => {
    if (activeIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeIndex, closeViewer, prevImage, nextImage]);

  if (loading) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Loading...</p>
      </div>
    );
  }

  if (!theme) {
    return (
      <div className={styles.page}>
        <p className={styles.muted}>Theme not found.</p>
        <Link href="/photography" className={styles.backLink}>
          ← Back to Photography
        </Link>
      </div>
    );
  }

  const active = activeIndex !== null ? images[activeIndex] : null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>{theme.name}</h1>
        <p className={styles.count}>
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </p>
      </header>

      {images.length === 0 ? (
        <p className={styles.muted}>No images in this theme yet.</p>
      ) : (
        <div className={styles.masonry}>
          {images.map((img, index) => (
            <button
              key={img.id}
              className={styles.tile}
              onClick={() => setActiveIndex(index)}
              onContextMenu={(e) => e.preventDefault()}
            >
              <Image
                src={img.fileUrl}
                alt={img.caption ?? theme.name}
                fill
                sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 33vw"
                className={styles.tileImage}
              />
              <div className={styles.tileOverlay} />
              {img.caption && (
                <span className={styles.tileCaption}>{img.caption}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen viewer */}
      {active && (
        <div className={styles.lightbox} onClick={closeViewer}>
          <button
            className={styles.closeBtn}
            onClick={closeViewer}
            aria-label="Close"
          >
            ✕
          </button>

          {images.length > 1 && (
            <>
              <button
                className={styles.navBtn + " " + styles.navBtnLeft}
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                className={styles.navBtn + " " + styles.navBtnRight}
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
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
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className={styles.lightboxImageWrap}>
              <Image
                src={active.fileUrl}
                alt={active.caption ?? theme.name}
                fill
                sizes="100vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>

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
