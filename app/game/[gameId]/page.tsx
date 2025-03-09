// @ts-nocheck
import { HomeWrapper } from "@/app/components/home-wrapper";
import { getGame } from "@/app/api/games";
import { Chat } from "@/app/components/chat";

export async function generateMetadata({ params: { gameId } }) {
  if (!gameId) return;
  const gameParams = { game_id: gameId };
  let title = "";
  let description = "";
  let cover = "";

  try {
    const {
      name = "RPGGO",
      intro = "",
      image = "",
    } = await getGame(gameParams);
    title = name;
    description = intro;
    cover = image;
  } catch (error: unknown) {
    console.error(error);
  }

  const metaData = {
    title,
    description,
    siteName: "RPGGO",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: cover,
        width: 800,
        height: 600,
        alt: "RPGGO",
      },
      {
        url: cover,
        width: 1800,
        height: 1600,
        alt: "RPGGO",
      },
    ],
  };

  return {
    ...metaData,
    openGraph: {
      ...metaData,
    },
  };
}

export default async function App() {
  return (
    <HomeWrapper session={{}}>
      <Chat />
    </HomeWrapper>
  );
}
