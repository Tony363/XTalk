/* eslint-disable @next/next/no-page-custom-font */
import "@/app/styles/globals.scss";
import "@/app/styles/markdown.scss";
import "@/app/styles/highlight.scss";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "RPGGO: AI Engine as Agent, Open World, Creator Platform",
  description:
    "The game lobby for AI powered text-based RPGs with unlimited freedom. Engage with AI NPCs and create games with AI engine.",
  keywords: [
    "ai rpg",
    "ai NPC",
    "text game",
    "ai game",
    "ai storyline",
    "game lobby",
    "game platform",
    "create rpg",
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    viewportFit: "cover",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  appleWebApp: {
    title: "RPGGO: AI Engine as Agent, Open World, Creator Platform",
    statusBarStyle: "default",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <>{children}</>
      </body>
    </html>
  );
}
