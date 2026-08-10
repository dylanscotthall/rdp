import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.brand}>RUDE._.DUDE</span>
        <span className={styles.copy}>
          &copy; {new Date().getFullYear()} Analise DuBose. All rights reserved.
        </span>
        <div className={styles.socials}>
          <a
            href="https://www.instagram.com/analise._.dubose"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            INSTAGRAM
          </a>
        </div>
      </div>
    </footer>
  );
}
