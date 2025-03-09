import isEmpty from "lodash/isEmpty";
import Log from "@/app/utils/log";
import { getServerSideConfig } from "@/app/config/server";
import { makePayload } from "@/app/utils/token";
import { isLocal } from "../utils/runtime-env";

const GAME_API_TIMEOUT = 60000;

export const gameServerPost = async (
  url: string,
  params: Record<string, any>,
  customHeader = {} as Record<string, any>,
) => {
  try {
    const { gameBearerToken: GAME_API_BEARER_TOKEN } = getServerSideConfig();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GAME_API_TIMEOUT);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...customHeader,
        "Content-Type": "application/json",
        Authorization: `Bearer ${GAME_API_BEARER_TOKEN}`,
        payload: makePayload(params),
      },
      body: JSON.stringify(params),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok && response.status !== 500) {
      throw new Error(`game server error, status code: ${response.status}`);
    }

    const responseBody = await response.json();
    if (isLocal()) Log.info("response result:", { url, ...responseBody });

    const { code, data, transaction_details = {} } = responseBody;
    if (!isEmpty(transaction_details))
      data.transaction_details = transaction_details;
    if (![0, 200].includes(code)) {
      return responseBody;
    } else {
      return data;
    }
  } catch (error: unknown) {
    // @ts-ignore
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw new Error(`network failed, details: ${error}`);
  }
};
