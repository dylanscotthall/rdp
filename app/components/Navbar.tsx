"use client";

import Link from "next/link";
import { useState } from "react";
import { useDarkMode } from "@/app/context/DarkModeContext";
import styles from "./Navbar.module.css";

const NAV_LINKS = [
  { href: "/photography", label: "PHOTOGRAPHY" },
  { href: "/videography", label: "VIDEOGRAPHY" },
  { href: "/map", label: "MAP" },
  // { href: "/blog", label: "PROJECTS" },
  { href: "/contact", label: "CONTACT" },
  { href: "/about", label: "ABOUT" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleDark } = useDarkMode();

  return (
    <nav className={`${styles.nav} blur-background`}>
      <h1 className={styles.logo}>
        <Link href="/">RUDE._.DUDE</Link>
      </h1>

      {/* Desktop links */}
      <ul className={styles.links}>
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Dark mode toggle — desktop */}
      <button
        className={styles.toggle}
        onClick={toggleDark}
        aria-label="Toggle dark mode"
      >
        {isDark ? (
          // Sun icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Hamburger — mobile only */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <ul className={styles.mobileMenu}>
          {NAV_LINKS.map((link) => (
            <li key={link.href} onClick={() => setMenuOpen(false)}>
              <Link href={link.href} className={styles.link}>
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              className={styles.mobileToggle}
              onClick={() => {
                toggleDark();
                setMenuOpen(false);
              }}
            >
              {isDark ? "☀ Light Mode" : "☾ Dark Mode"}
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
