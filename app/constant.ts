export const OWNER = "RPGGO-AI";
export const REPO = "singularity";
export const REPO_URL = `https://github.com/${OWNER}/${REPO}`;
export const ISSUE_URL = `https://github.com/${OWNER}/${REPO}/issues`;
export const UPDATE_URL = `${REPO_URL}#keep-updated`;
export const RELEASE_URL = `${REPO_URL}/releases`;
export const FETCH_COMMIT_URL = `https://api.github.com/repos/${OWNER}/${REPO}/commits?per_page=1`;
export const FETCH_TAG_URL = `https://api.github.com/repos/${OWNER}/${REPO}/tags?per_page=1`;
export const RUNTIME_CONFIG_DOM = "danger-runtime-config";
export const DIA_GO_API_URL = process.env.DIA_GO_API_URL || "";
export const DEFAULT_SOURCE = "web-game";
export const RPGGO_URL = "https://rpggo.ai";
export const ABOUT_URL = "https://rpggo.ai/about-us";
export const DEVELOPER = "https://developer.rpggo.ai/dev-docs";
export const CREATOR_URL = "https://creator.rpggo.ai";
export const AUTH_URL = "http://auth.rpggo.ai/";
export const MEDIUM_URL = "https://rpggo.medium.com";
export const DISCORD_URL = "https://discord.com/invite/xZQHpSxyMT";
export const TWITTER_URL = "https://twitter.com/RpggoAi";
export const REDDIT_URL = "https://www.reddit.com/r/RPGGOAI/";

export const POLICY = {
  service:
    "https://app.termly.io/document/terms-of-service/abba338c-6aee-4564-a408-51a0dee6fcf7",
  privacy:
    "https://app.termly.io/document/privacy-policy/cfc52d38-4d4e-4cf0-9e8b-ba66da86fb10",
  cookie:
    "https://app.termly.io/document/cookie-policy/88ec911a-5274-4906-b75c-e62923ad3b67",
};

export enum Path {
  Home = "/",
  Chat = "/game",
  Char = "/char",
}

export enum ApiPath {
  Cors = "/api/cors",
  OpenAI = "/api/openai",
}

export enum StoreKey {
  Chat = "rpggo-web-store",
  Config = "app-config",
  User = "user",
}

export const DEFAULT_SIDEBAR_WIDTH = 300;
export const MAX_SIDEBAR_WIDTH = 500;
export const MIN_SIDEBAR_WIDTH = 230;
export const NARROW_SIDEBAR_WIDTH = 100;

export const ACCESS_CODE_PREFIX = "nk-";

export const LAST_INPUT_KEY = "last-input";
export const UNFINISHED_INPUT = (id: string) => "unfinished-input-" + id;

export const STORAGE_KEY = "rpggo-web";

export const REQUEST_TIMEOUT_MS = 60000;

export const EXPORT_MESSAGE_CLASS_NAME = "export-markdown";

export const GamePath = {
  Start: "startgame",
  GameInfo: "gameinfo",
  ChatSSE: "chatsse",
};

export const DEFAULT_INPUT_TEMPLATE = `{{input}}`; // input / time / model / lang

export const CHAT_PAGE_SIZE = 100;
export const MAX_RENDER_MSG_COUNT = 45;

export const GAME_DEFAULT_BG =
  "https://storage.googleapis.com/rpggo_images/diago/background-image.png";

export const MAX_VOICE_DURATION = 10;
export const MIN_VOICE_DURATION = 1;

export enum PicviewStatus {
  Loading = "Loading",
  Preview = "Preview",
  Expired = "Expired",
  Error = "Error",
}
