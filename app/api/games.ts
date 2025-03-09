import isEmpty from "lodash/isEmpty";
import Log from "@/app/utils/log";
import { getServerSideConfig } from "@/app/config/server";
import { gameServerPost } from "./gameServerPost";

export enum PublishState {
  published = "published",
  unpublished = "unpublished",
}

export type Game = {
  id: string;
  name: string;
  background: string;
  intro: string;
  image: string;
  genre: PublishState;
  mechanics: string[];
  chapters: Chapter[];
  playedCount: number;
  isHasVoice: boolean;
  category: string;
  author: any;
  interaction: any;
  tags: string[];
  background_musics: any[];
};

export type Chapter = {
  id: string;
  name: string;
  image: string;
  intro: string;
  background: string;
};

type StartGamesParams = {
  session_id: string;
  game_id: string;
  message_id?: string;
  chapter_id: string;
  source?: string;
  user_id: string;
  nextChapter: boolean;
  country: string;
};

type GetGamesParams = {
  game_id: string;
  country: string;
  user_id: string;
};

type ChapterResponse = {
  id: string;
  name: string;
  type: string;
};

type GameResponseChapter = {
  msg?: string;
  code?: number;
  init_dialog: string;
  characters: ChapterResponse[];
  details: string[];
} & Chapter;

type GameResponse = Game & GameResponseChapter;

export const startGame = async (
  params: StartGamesParams,
): Promise<Game & GameResponseChapter> => {
  let result: Game & GameResponseChapter = {} as Game & GameResponseChapter;
  const { nextChapter = false } = params || {};
  const { gameHost: GAME_HOST } = getServerSideConfig();
  let url = `${GAME_HOST}/v2/open/game/startgame`;
  if (nextChapter) {
    url = `${GAME_HOST}/v2/open/game/changechapter`;
  }

  try {
    const {
      game_id: id,
      name,
      image,
      background,
      intro,
      chapter,
    } = await gameServerPost(url, params);

    // @ts-ignore
    result = { id, name, image, background, intro, chapter } as Game &
      GameResponseChapter;
  } catch (error: unknown) {
    Log.error(`start game failed, detail: ${JSON.stringify(error)}`);
  }

  return result;
};

export const getGame = async (
  params: GetGamesParams,
): Promise<Game & GameResponseChapter> => {
  let result: Game & GameResponseChapter = {} as GameResponse;

  const { gameHost: GAME_HOST } = getServerSideConfig();
  const url = `${GAME_HOST}/v2/open/game/gamemetadata`;
  const { user_id, game_id, country = "default" } = params;

  try {
    const gameInfo = await gameServerPost(
      url,
      { game_id, user_id },
      { country },
    );

    const {
      mechanics,
      category,
      game_id: id,
      background,
      chapters,
      author = {},
      interaction = {},
      background_musics = [],
      genre = "",
      game_tags = [],
    } = gameInfo || {};

    let { name, image, intro, tagsdata = [] } = gameInfo?.game_info || {};

    let isHasVoice = false;
    if (category === "solo-character") {
      const character = chapters[0].characters[0];
      isHasVoice = !isEmpty(character.voice_profile);
      ({ avatar: image, name, intro, character_tags: tagsdata } = character);
    } else {
      tagsdata = game_tags;
      for (const chapter of chapters) {
        if (chapter.characters) {
          for (const character of chapter.characters) {
            if (character.voice_profile) {
              isHasVoice = true;
              break;
            }
          }
        }
        if (isHasVoice) break;
      }
    }

    const tags = tagsdata?.map((item: any) => item.name);

    // @ts-ignore
    result = {
      mechanics,
      isHasVoice,
      category,
      id,
      name,
      image,
      background,
      intro,
      chapters,
      author,
      playedCount: interaction?.played_count || 0,
      background_musics,
      genre,
      tags,
    };
  } catch (error: unknown) {
    Log.error(`get game info failed, detail: ${JSON.stringify(error)}`);
  }

  return result;
};
