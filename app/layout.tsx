/* eslint-disable @next/next/no-page-custom-font */
import "./styles/globals.scss";
import "./styles/markdown.scss";
import "./styles/highlight.scss";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "RPGGO: Play and Create AI RPG and NPCs with Text to Game Engine",
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
      <head>
        <link rel="manifest" href="/site.webmanifest"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700;900&display=swap%22%20rel=%22stylesheet"
          rel="stylesheet"
        />
        <script src="/serviceWorkerRegister.js" defer></script>
      </head>
      <body>
        <>{children}</>
      </body>
    </html>
  );
}
