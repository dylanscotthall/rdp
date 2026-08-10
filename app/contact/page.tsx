"use client";

import { useState } from "react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Contact Me</h1>
        <p className={styles.subtitle}>
          For bookings, collaborations, or inquiries — reach out below.
        </p>

        {!submitted ? (
          <form
            className={`${styles.form} blur-background border-blueprint`}
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className={styles.label}>
              Name
              <input type="text" required className={styles.input} />
            </label>
            <label className={styles.label}>
              Email
              <input type="email" required className={styles.input} />
            </label>
            <label className={styles.label}>
              Message
              <textarea required className={styles.textarea}></textarea>
            </label>
            <button type="submit" className={styles.button}>
              Send Message
            </button>
          </form>
        ) : (
          <p className={styles.success}>
            Thank you! Your message has been sent.
          </p>
        )}
      </main>
    </div>
  );
}
