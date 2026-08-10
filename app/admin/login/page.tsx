"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = searchParams.get("from") ?? "/admin";

  // If already authed, redirect immediately
  useEffect(() => {
    fetch("/admin", { method: "HEAD", redirect: "manual" }).then((res) => {
      // If the /admin route doesn't redirect us, we're already logged in
      if (res.type !== "opaqueredirect" && res.ok) {
        router.replace(from);
      }
    });
  }, [from, router]);

  const handleSubmit = async () => {
    if (!password) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace(from);
      } else {
        const data = await res.json();
        setError(data.error ?? "Invalid password");
        setPassword("");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin</h1>
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          autoFocus
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <p className={styles.error}>{error}</p>}
        <button
          className={styles.btn}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "..." : "Enter"}
        </button>
      </div>
    </div>
  );
}
