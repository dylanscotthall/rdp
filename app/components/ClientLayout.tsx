"use client";

import Footer from "./Footer";
import MapBackground from "./MapBackground";
import Navbar from "./Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MapBackground />
      <Navbar />
      <main style={{ paddingTop: "60px" }}>{children}</main>
      <Footer />
    </>
  );
}
