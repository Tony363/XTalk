import qs from "qs";
import isEmpty from "lodash/isEmpty";
import { generatePath } from "react-router-dom";
import { Path } from "@/app/constant";

// client only
export function getSearchParams() {
  if (typeof window === "undefined") return {};
  const [, searchParams] = window.location.search.split("?");
  if (!searchParams) {
    return {};
  }

  return qs.parse(searchParams);
}

export function getHashParams() {
  if (typeof window === "undefined") return {};
  const [, searchParams] = window.location.hash.split("?");
  if (!searchParams) {
    return {};
  }
  return qs.parse(searchParams);
}

export function getInviteCode() {
  const { invite_code } = getSearchParams();
  return {
    invite_code,
  };
}

export function getUrl(url: string): string {
  const searchParams = getSearchParams();
  if (isEmpty(searchParams)) return url;

  return `${url}?${qs.stringify(searchParams)}`;
}

export function generateGamePath(gameId: string, chapterId: string) {
  const hashPath = generatePath(`${Path.Chat}/:gameId`, {
    gameId,
  });
  return `${hashPath}`;
}

export function generateCharacterPath(cid: string, chapterId: string) {
  const hashPath = generatePath(`${Path.Char}/:cid`, {
    cid,
  });
  return `${hashPath}`;
}

export function getGameIdFromPath() {
  const { pathname } = window?.location || {};
  const parts = pathname.split("/");
  const gameId = parts[parts.length - 1];
  return gameId;
}

// /a /b false
// /game/xx true
// /game/xx?gameId=xoo false
export function isInvalidGamePath() {
  const { hash = "", pathname } = window?.location || {};
  const [, searchParamsString] = hash.split("?");
  const { gameId = "" } = qs.parse(searchParamsString) || {};
  return !!(pathname?.startsWith("/game/") && !gameId);
}

export function isInvalidCharacterPath() {
  const { hash = "", pathname } = window?.location || {};
  const [, searchParamsString] = hash.split("?");
  const { cid = "" } = qs.parse(searchParamsString) || {};
  return !!(pathname?.startsWith("/character/") && !cid);
}

export function isInvalidCharPath() {
  const { hash = "", pathname } = window?.location || {};
  const [, searchParamsString] = hash.split("?");
  const { cid = "" } = qs.parse(searchParamsString) || {};
  return !!(pathname?.startsWith("/char/") && !cid);
}
