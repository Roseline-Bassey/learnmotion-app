import type { Metadata } from "next";
import "./globals.css";
import { AnalysisProvider } from "@/context/AnalysisContext";

export const metadata: Metadata = {
  title: "LearnMotion — Decode simple motion",
  description:
    "Upload a video or paste a YouTube link and get a step-by-step motion design breakdown.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AnalysisProvider>{children}</AnalysisProvider>
      </body>
    </html>
  );
}
