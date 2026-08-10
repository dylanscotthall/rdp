"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type Theme } from "@/app/lib/api";
import styles from "./videography.module.css";

export default function VideographyPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .fetchThemes()
      .then(setThemes)
      .finally(() => setLoading(false));
  }, []);

  // Only show themes that actually have a cover video set
  const videoThemes = themes.filter((t) => t.coverVideo);

  return (
    <div className={styles.page}>
      {loading ? (
        <p className={styles.muted}>Loading...</p>
      ) : videoThemes.length === 0 ? (
        <p className={styles.muted}>No video themes yet.</p>
      ) : (
        <div className={styles.grid}>
          {videoThemes.map((theme) => (
            <Link
              key={theme.id}
              href={`/videography/${theme.id}`}
              className={styles.card}
            >
              <div className={styles.cardVideoWrap}>
                <video
                  src={theme.coverVideo!.fileUrl}
                  muted
                  loop
                  playsInline
                  className={styles.cardVideo}
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
                <div className={styles.cardOverlay} />
                <div className={styles.playIcon}>▶</div>
              </div>
              <span className={styles.cardLabel}>{theme.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
