import { GamePath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { startGame, getGame } from "@/app/api/games";

const ALLOWED_PATH = new Set(Object.values(GamePath));

async function getGameInfo(req: NextRequest, user_id: string) {
  const { gameId } = await req.json();
  const country = req.headers.get("req-country") || ("default" as string);
  const params = {
    game_id: gameId,
    user_id,
    country,
  };
  const result = await getGame(params);
  const { code, msg, details } = result;
  if (code) {
    return NextResponse.json(
      { code, msg: JSON.stringify(details) || msg, data: {} },
      { status: 200 },
    );
  }
  return NextResponse.json(
    { data: result, code: 0, msg: "success" },
    { status: 200 },
  );
}

async function handle(
  req: NextRequest,
  res: {
    headers: any;
    params: { path: string[] };
  },
) {
  const { params } = res;
  let session = {
    name: "RPGGO",
    email: "",
    avatar: "",
    user: { id: `tourist_${nanoid()}` },
  };

  // @ts-ignore
  const uid = (session?.user as { id: string })?.id || "";

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const path = params.path.join("/");

  if (!ALLOWED_PATH.has(path)) {
    console.log("[Game Route] forbidden path ", path);
    return NextResponse.json(
      {
        error: true,
        msg: "you are not allowed to request " + path,
      },
      {
        status: 403,
      },
    );
  }
  try {
    switch (path) {
      case "startgame":
        const { sessionId, gameId, messageId, chapterId, source, nextChapter } =
          await req.json();

        const gameParams = {
          session_id: sessionId,
          game_id: gameId,
          message_id: messageId,
          chapter_id: chapterId,
          source: source,
          user_id: uid,
          nextChapter,
        };
        const result = await startGame(gameParams);
        return NextResponse.json(
          { data: result, code: 0, msg: "success" },
          { status: 200 },
        );
      case "gameinfo":
        return await getGameInfo(req, uid);
      case "chat":
        const chatParams = await req.json();
        const chatResponse = await chat(chatParams);
        return NextResponse.json(
          {
            data: chatResponse,
            code: 0,
            msg: "success",
          },
          { status: 200 },
        );
      default:
        break;
    }
  } catch (error: unknown) {
    console.error("[API] ", error);
    return NextResponse.json(prettyObject(error));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "nodejs";
export const preferredRegion = [
  "arn1",
  "bom1",
  "cdg1",
  "cle1",
  "cpt1",
  "dub1",
  "fra1",
  "gru1",
  "hnd1",
  "iad1",
  "icn1",
  "kix1",
  "lhr1",
  "pdx1",
  "sfo1",
  "sin1",
  "syd1",
];
