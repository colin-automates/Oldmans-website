import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${protocol}://${host}` : "https://joeghomes.com";
  const socialImage = new URL("/og.png", origin).toString();

  return {
    metadataBase: new URL(origin),
    title: "Joseph Gioielli | Clarksville & Fort Campbell Real Estate",
    description:
      "Buy, sell, or relocate with Joseph Gioielli, a retired Army veteran and local real estate guide serving Clarksville, Montgomery County, and Fort Campbell.",
    icons: {
      icon: "/icon.png",
      shortcut: "/icon.png",
    },
    openGraph: {
      title: "Joseph Gioielli | Real Estate, clearly guided.",
      description:
        "Trusted guidance for Clarksville, Montgomery County, and Fort Campbell homes.",
      type: "website",
      images: [{ url: socialImage, width: 1792, height: 928 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Joseph Gioielli | Real Estate, clearly guided.",
      description:
        "Trusted guidance for Clarksville, Montgomery County, and Fort Campbell homes.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
