import type { Metadata, Viewport } from "next";

import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://gabeamare.net"),
  title: "gabeamare(dot)net",
  description:
    "Gabe Amare is a student engineer from the DMV building robots, organizing hackathons, and following his curiosity.",
  openGraph: {
    title: "Gabe Amare",
    description:
      "Student engineer, robot builder, hackathon organizer, and curious person.",
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#1d0cff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
