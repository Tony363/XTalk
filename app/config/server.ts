export function getGameHost() {
  return process.env.NEXT_PUBLIC_GAME_SERVICE_HOST || "https://api.rpggo.ai";
}

export const getServerSideConfig = () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  return {
    gameHost: getGameHost(),
    gameBearerToken: process.env.GAME_API_BEARER_TOKEN,
  };
};
