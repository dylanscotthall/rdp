"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./photography.module.css";

interface Theme {
  id: number;
  name: string;
  coverImageId: string | null;
  coverImage: { id: string; fileUrl: string } | null;
}

export default function PhotographyPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/themes")
      .then((r) => r.json())
      .then(setThemes)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <p className={styles.muted}>Loading...</p>
      ) : themes.length === 0 ? (
        <p className={styles.muted}>No themes yet.</p>
      ) : (
        <div className={styles.grid}>
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/photography/${theme.id}`}
              className={styles.card}
            >
              <div className={styles.cardImageWrap}>
                {theme.coverImage ? (
                  <Image
                    src={theme.coverImage.fileUrl}
                    alt={theme.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={styles.cardImage}
                  />
                ) : (
                  <div className={styles.cardPlaceholder}>No cover set</div>
                )}
                <div className={styles.cardOverlay} />
              </div>
              <span className={styles.cardLabel}>{theme.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
