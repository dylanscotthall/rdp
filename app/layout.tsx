import type { Metadata } from "next";
import { DarkModeProvider } from "@/app/context/DarkModeContext";
import ClientLayout from "@/app/components/ClientLayout";
import { themeInitScript } from "@/app/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "RUDE._.DUDE",
  description: "Photography & Videography",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <DarkModeProvider>
          <ClientLayout>{children}</ClientLayout>
        </DarkModeProvider>
      </body>
    </html>
  );
}
