// @ts-nocheck
import Locale, { getLang } from "../locales";
import { showLogin, showToast } from "../components/ui-lib";
import { ModelType } from "./config";
import {
  DEFAULT_INPUT_TEMPLATE,
  DIA_GO_API_URL,
  StoreKey,
  DEFAULT_SOURCE,
} from "../constant";
import { api, getHeaders, RequestMessage } from "../client/api";
import { ChatControllerPool } from "../client/controller";
import { prettyObject } from "../utils/format";
import { estimateTokenLength } from "../utils/token";
import { nanoid } from "nanoid";
import { createPersistStore } from "../utils/store";
import isEmpty from "lodash/isEmpty";
import { User } from "@/app/store/user";
import { GAME_ACTION } from "@/app/client/constants";
import { CHARACTER_TYPE } from "@/app/constants/character";
import { getSearchParams, getUrl } from "@/app/utils/url";

import { useUserStore } from "../store";
import { showGGToast } from "@/app/components/ui-lib";
import { PicviewStatus } from "@/app/constant";

let fetchState = 0; // 0 not fetch, 1 fetching, 2 done

export type CHARACTER = {
  id: string;
  name: string;
  avatar: string;
  type: (typeof CHARACTER_TYPE)[keyof typeof CHARACTER_TYPE];
};

export type INIT_DIALOG = {
  character_id: string;
  message: string;
  name: string;
  llm: boolean;
  index: number;
};

export type GOAL_INFO = {
  all_trigger_fail: boolean;
  goal_displayed: string;
};

export type GOAL_ANCHOR = {
  id: string;
  character_id: string;
  affiliate: string;
  anchor_name: string;
  affiliate_type: string;
  anchor_init_value: number;
  author: any;
  anchor_goal_reached_value: number;
};

export type SUGGOALS = {
  subgoal: string;
  goal_anchor: GOAL_ANCHOR[];
  id: string;
};

export type GOAL = {
  key: string;
  value: string;
  subgoals: SUGGOALS[];
};

export type CHAPTER = {
  name: string;
  chapter_id: string;
  background: string;
  intro: string;
  image: string;
  init_dialog: INIT_DIALOG[];
  characters: CHARACTER[];
  goal_info?: GOAL_INFO;
  goals?: GOAL[];
};

export type Game = {
  author: {
    user_id: string;
  };
  id: string;
  name: string;
  image: string;
  background: string;
  intro: string;
  chapters: CHAPTER[];
  chapter: CHAPTER;
  genre: PublishState;
};

export const GAME_STATE = {
  waitStart: 0,
  pending: 1,
  inProgress: 2,
  finished: 3,
  interrupt: 10000602,
};

export enum PublishState {
  published = "published",
  unpublished = "unpublished",
  opensource = "opensource",
}

export type SYSTEM_MESSAGE = {
  onlyKey?: string;
  title?: string;
  description?: string;
  image?: string;
  type?: string;
  action?: number;
  debugInfo?: string;
};

const DEFAULT_GAMES_STATE = {
  state: GAME_STATE.waitStart,
  characters: [],
  currentCharacter: {},
  playedCount: 0,
};

export const createEmptyGame = () => {
  return {
    ...DEFAULT_GAMES_STATE,
    author: {
      user_id: "",
    },
    id: "",
    name: "",
    image: "",
    background: "",
    intro: "",
    chapter: [],
  } as Game;
};

export const createSystemMessage = ({
  onlyKey = "",
  title = "",
  description = "",
  image = "",
  type = "",
  action = "",
  debugInfo = "",
}: SYSTEM_MESSAGE): SYSTEM_MESSAGE => {
  return {
    onlyKey,
    title,
    description,
    image,
    type,
    action,
    debugInfo,
  };
};
// ==== end game ===

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  id: string;
  model?: ModelType;
  user?: CHARACTER;
};

export type UserInputParams = {
  type?: number;
  content: string;
  character: any;
  sessionId: string;
  user: User;
  toUser: User;
};

export const MESSAGE_ROLE = {
  system: "system",
  user: "user",
  assistant: "assistant",
};

export const SYSTEM_MESSAGE_TYPE = {
  welcome: "welcome",
  finish: "finish",
  picture: "picture",
  gameover: "gameover",
};

export const messageState = {
  isRead: false,
  isGetNextMessage: false,
  isGeneratedPicture: false,
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  const _messageState = {
    ...messageState,
    ...(override.messageState || messageState),
  };
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    user: {},
    ...override,
    messageState: _messageState,
  };
}

export interface ChatStat {
  tokenCount: number;
  wordCount: number;
  charCount: number;
}

export type GameDisplayStatu = {
  [key: string]: {
    value: number;
    anchor_goal_reached_value: string;
    anchor_init_value: string;
    value: number;
  };
};

export type GoalStatu = {
  achieved: boolean;
  goal: string;
};

export interface ChatSession {
  id: string;
  topic: string;
  gameId: string;

  memoryPrompt: string;
  messages: ChatMessage[];
  stat: ChatStat;
  lastUpdate: number;
  lastSummarizeIndex: number;
  clearContextIndex?: number;
  gameDisplayStatus: GameDisplayStatu;
  goalStatus: GoalStatu[];
}

interface ConsumptionPreOption {
  consumptionType: "ImageConsumption" | "NPCVoice";
  chapterId: string;
  t: any; //i18
}

export const DEFAULT_TOPIC = Locale.Store.DefaultTopic;
export const BOT_HELLO: ChatMessage = createMessage({
  role: "assistant",
  content: Locale.Store.BotHello,
});

const { gameId, characterId, cid } = getSearchParams();

function createEmptySession(): ChatSession {
  return {
    id: nanoid(),
    topic: DEFAULT_TOPIC,
    memoryPrompt: "",
    messages: [],
    stat: {
      tokenCount: 0,
      wordCount: 0,
      charCount: 0,
    },
    lastUpdate: Date.now(),
    lastSummarizeIndex: 0,
    gameId: gameId || characterId || cid,
    chapterId: "",
    gameState: GAME_ACTION.CURRENT,
    gameDisplayStatus: {},
    goalStatus: [],
    waitPlayMessage: [],
  };
}

function countMessages(msgs: ChatMessage[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0);
}

function fillTemplateWith(input: string, modelConfig: any) {
  const vars = {
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}

const DEFAULT_CHAT_STATE = {
  sessions: [createEmptySession()],
  currentSessionIndex: 0,
  currentChapterId: "",
  currentTimestamp: 0,
  // isCutAutoScroll: false,
  game: createEmptyGame(),
  // detail card
  drawerConfig: {
    isShow: true,
    currentTab: "MENU",
  },
  GGPlusList: [],
  ggplusConfig: {},
  isGGIntroduceShow: false,
  gameProgress: {
    progressing: false,
    page: 1,
    list: [],
    isMore: false,
  },
  proressKey: "",
};

export const useChatStore = createPersistStore(
  DEFAULT_CHAT_STATE,
  (set, _get) => {
    function get() {
      return {
        ..._get(),
        ...methods,
      };
    }

    const methods = {
      async getChatProgress({ type }) {
        if (type === "GET_MORE") {
          set({
            gameProgress: {
              ...get().gameProgress,
              page: get().gameProgress.page + 1,
            },
          });
        }

        return fetch(
          getUrl(`${DIA_GO_API_URL}/api/open/rpggo/getchatprogress`),
          {
            method: "POST",
            body: JSON.stringify({
              page: get().gameProgress.page,
              session_id: get().game.record.record_id,
            }),
            headers: {
              ...getHeaders(),
            },
          },
        )
          .then((res) => res.json())
          .then((res: any) => {
            if (res.code === 0) {
              set({
                gameProgress: {
                  ...get().gameProgress,
                  isMore: res.data.isMore,
                },
              });
              get().recoveryChatProgress(type, res.data.list);
            }
          })
          .catch(() => {})
          .finally(() => {});
      },
      isContinue() {
        return get().game?.record?.record_id;
      },
      isSoloNpc() {
        return get().game.category === "solo-character";
      },
      isPlotGame() {
        return get().game.category !== "solo-character";
      },
      isNSFWGame() {
        return get().game?.tags?.includes("NSFW");
      },
      setIsGGIntroduceShow(isGGIntroduceShow) {
        set({ isGGIntroduceShow });
      },

      continuingGame() {
        get().getChatProgress({ type: "REFRESH", page: 1 });
        const game = {
          ...get().game,
          state: GAME_STATE.inProgress,
        };
        set(() => ({ game }));

        ChatControllerPool.stopAll();
      },
      selectNPC(targetChapter) {
        const characters = targetChapter?.characters || [];
        const currentCharacter = characters?.[0] || {};
        set({
          game: {
            ...get().game,
            chapter: targetChapter,
            characters,
            currentCharacter,
          },
        });
      },
      selectSessionById(sessionId) {
        const index = get().sessions.findIndex((item) => item.id === sessionId);
        get().selectSession(index);

        const noEmptyContent = get()
          .currentSession()
          .messages.filter((s) => s.content !== "");
        get().updateCurrentSession((session) => {
          session.messages = noEmptyContent;
          session.lastUpdate = Date.now();
        });

        const game = {
          ...get().game,
          state: GAME_STATE.inProgress,
        };
        set(() => ({ game }));
      },
      setDrawerConfig({ isShow = false, currentTab = "" }) {
        set({
          drawerConfig: {
            isShow,
            currentTab,
          },
        });
      },
      clearSessions() {
        set(() => ({
          sessions: [createEmptySession()],
          currentSessionIndex: 0,
        }));
      },
      setProressKey(proressKey) {
        set(() => ({ proressKey }));
      },
      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },
      clearInvalidSessions() {
        const allSession = get().sessions;
        const validSession = allSession.filter(
          (s) => !isEmpty(s.gameState) || s.gameState !== GAME_ACTION.CURRENT,
        );
        set(() => ({ sessions: validSession }));
      },
      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      newSession() {
        const session = createEmptySession();

        set((state) => ({
          currentSessionIndex: 0,
          sessions: [session].concat(state.sessions),
        }));
      },

      nextSession(delta: number) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      deleteSession(index: number = 0) {
        const deletingLastSession = get().sessions.length === 1;
        const deletedSession = get().sessions.at(index);

        if (!deletedSession) return;

        const sessions = get().sessions.slice();
        sessions.splice(index, 1);

        const currentIndex = get().currentSessionIndex;
        let nextIndex = Math.min(
          currentIndex - Number(index < currentIndex),
          sessions.length - 1,
        );

        if (deletingLastSession) {
          nextIndex = 0;
          sessions.push(createEmptySession());
        }

        // for undo delete action
        const restoreState = {
          currentSessionIndex: get().currentSessionIndex,
          sessions: get().sessions.slice(),
        };

        set(() => ({
          currentSessionIndex: nextIndex,
          sessions,
        }));
      },
      currentSession() {
        let index = get().currentSessionIndex;
        const sessions = get().sessions;
        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      onNewMessage(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.messages = session.messages.concat();
          session.lastUpdate = Date.now();
        });
        get().updateStat(message);
      },

      async onUserInput(params: UserInputParams) {
        const {
          type,
          content,
          character,
          sessionId,
          user,
          toUser,
          game = {},
          url = "",
        } = params;
        const session = get().currentSession();
        const modelConfig = {};
        const userContent = fillTemplateWith(content, modelConfig);

        // console.log("[User Input] after template: ", userContent);
        const userMessage: ChatMessage = createMessage({
          role: "user",
          content: userContent,
          user,
          messageState: {
            characterAudio: url,
          },
        });
        if (type) userMessage.type = type;
        const botMessage: ChatMessage = createMessage({
          role: "assistant",
          streaming: true,
          model: modelConfig.model,
          user: toUser,
        });

        // get recent messages
        // const recentMessages = get().getMessagesWithMemory();
        const recentMessages = [];
        const sendMessages = recentMessages.concat(userMessage);
        const messageIndex = get().currentSession().messages.length + 1;

        // save user's and bot's message
        get().updateCurrentSession((session) => {
          const savedUserMessage = {
            ...userMessage,
            content,
          };
          session.messages = session.messages.concat([
            savedUserMessage,
            botMessage,
          ]);
        });
        // make request
        api.llm.chat({
          messages: sendMessages,
          character,
          sessionId,
          user,
          game,
          userVoice: url,
          config: { ...modelConfig, stream: true },
          onUpdate(message, options = {}) {
            botMessage.streaming = true;
            const { role } = options;
            if (message) {
              botMessage.content = message;
              if (role) {
                botMessage.role = role;
              }
            }

            get().onNewMessage(botMessage);
          },
          onNextMessage(message, options = {}) {
            const {
              nextCharacterId,
              character,
              role = MESSAGE_ROLE.assistant,
              systemMessage = {},
              logId = "",
            } = options;
            // first reply
            if (character?.id === botMessage.user?.id && botMessage.streaming) {
              this.onFinish(message, options);
              return;
            }
            const nexMessage: ChatMessage = createMessage({
              logId,
              role,
              content: message,
              streaming: false,
              user: get().getCharacterById(nextCharacterId),
              systemMessage,
            });

            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat([nexMessage]);
            });

            get().onNewMessage(nexMessage);
          },
          onFinish(message, options = {}) {
            botMessage.streaming = false;
            const { role, logId, chapterId = "", messageId } = options;
            botMessage.logId = logId;
            botMessage.chapterId = chapterId;
            botMessage.originId = messageId;
            if (message) {
              botMessage.content = message;
              if (role) {
                botMessage.role = role;
              }
              get().onNewMessage(botMessage);
            }
            ChatControllerPool.remove(session.id, botMessage.id);
          },
          onStopAll(reason = "Game is over!") {
            if (!botMessage.streaming) return;
            botMessage.content += reason;
            botMessage.streaming = false;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            ChatControllerPool.stopAll();

            console.error("[Chat] stop all connections ", reason);
          },
          onError(error) {
            const isAborted = error.message.includes("aborted");
            botMessage.content +=
              "\n\n" +
              prettyObject({
                error: true,
                message: error.message,
              });
            botMessage.streaming = false;
            userMessage.isError = !isAborted;
            botMessage.isError = !isAborted;
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat();
            });
            ChatControllerPool.remove(
              session.id,
              botMessage.id ?? messageIndex,
            );

            console.error("[Chat] failed ", error);
          },
          onController(controller) {
            // collect controller for stop/retry
            ChatControllerPool.addController(
              session.id,
              botMessage.id ?? messageIndex,
              controller,
            );
          },
          onUpdateGameState(params: any) {
            const { action, chapterId } = params;
            if (action === GAME_ACTION.END) {
              get().finish();
              get().updateCurrentSession((session) => {
                session.gameState = GAME_ACTION.END;
              });
              return;
            }

            if (action === GAME_ACTION.NEXT_SCENE) {
              const proressKey = `${chapterId}_${action}`;
              if (proressKey === get().proressKey) {
                return;
              }
              console.groupEnd();
              get().setProressKey(proressKey);
              get().startGame(params, true);
            }
          },
          onUpdateTransactionDetails(info) {
            console.log("onUpdateTransactionDetails", info);
          },
        });
      },
      async initialDialog(messages, from) {
        const game = get().game;
        const isSoloNpc = get().isSoloNpc();
        const isPlotGame = get().isPlotGame();
        if (isEmpty(game)) return;
        try {
          const initMessages = [];
          const { name: gameName, category } = game;
          // generation dialog
          const chapter = game?.chapter;
          const {
            init_dialog: initDialog,
            opening_messages: openingMessages,
            name: chapterName,
            background: chapterBackground,
            image: chapterImage,
            background_audio: backgroundAudio,
            chapter_id: chapterId,
          } = chapter;

          const systemMessage = createSystemMessage({
            type: SYSTEM_MESSAGE_TYPE.welcome,
          });

          if (!isEmpty(chapterName)) {
            systemMessage.title = chapterName;
          }
          if (!isEmpty(chapterBackground)) {
            systemMessage.description = chapterBackground;
          }

          if (!isEmpty(chapterImage)) {
            systemMessage.image = chapterImage;
          }

          if (!isEmpty(backgroundAudio)) {
            systemMessage.backgroundAudio = backgroundAudio;
          }

          if (!isEmpty(chapterId)) {
            systemMessage.chapterId = chapterId;
          }

          const content = createMessage({
            role: MESSAGE_ROLE.system,
            content: `Game: ${gameName} \n Chapter: ${chapterName}\n\n ${systemMessage.description}`,
            systemMessage,
            messageState: { isGetNextMessage: true },
          });

          if (isPlotGame) initMessages.push(content);

          if (!isEmpty(openingMessages) && category === "solo-character") {
            window.removeEventListener("typewriterEnd", get().autoTypewriter);

            openingMessages.forEach((dialog: any) => {
              const user = get().getCharacterById(chapterId);
              const content = createMessage({
                role: MESSAGE_ROLE.assistant,
                content: `${dialog}`,
                user,
                chapterId,
                messageState: { isGetNextMessage: true },
              });
              get().updateCurrentSession((session) => {
                session.messages.push(content);
              });
            });
          }

          if (!isEmpty(initDialog) && category !== "solo-character") {
            window.removeEventListener("typewriterEnd", get().autoTypewriter);

            initDialog.forEach((dialog: any) => {
              const { message, character_id: characterId } = dialog || {};
              const user = get().getCharacterById(characterId);
              const content = createMessage({
                role: MESSAGE_ROLE.assistant,
                content: `${message}`,
                user,
                chapterId,
                messageState: { isGetNextMessage: true },
              });
              get().updateCurrentSession((session) => {
                session.waitPlayMessage.push(content);
              });
            });

            // start auto playing
            window.addEventListener("typewriterEnd", get().autoTypewriter);
          }

          const sendMessages = !isEmpty(messages) ? messages : initMessages;

          if (!isEmpty(sendMessages)) {
            get().updateCurrentSession((session) => {
              session.messages = session.messages.concat(sendMessages);
            });
          }
        } catch (error: unknown) {
          console.log("[Game] send initial dialog error:", error);
        }
      },

      autoTypewriter() {
        if (get().currentSession().waitPlayMessage.length) {
          get().updateCurrentSession((session) => {
            session.messages = session.messages.concat(
              get().currentSession().waitPlayMessage.shift(),
            );
          });
        }
      },

      setIsCutsAutoScroll(isCutAutoScroll: boolean) {
        set(() => ({ isCutAutoScroll }));
      },
      updateStat(message: ChatMessage) {
        get().updateCurrentSession((session) => {
          session.stat.charCount += message.content.length;
        });
      },
      updateCurrentSession(updater: (session: ChatSession) => void) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },
      _findMessageIndexById(messages: Message[], messageId: string): number {
        return messages
          .filter((message): message is Message => message !== undefined)
          .findIndex((message) => message.id === messageId);
      },
      updateCurrentMessage(messageId: string, extend: any) {
        const currentMessages = get().currentSession().messages;
        const currentMessageIdx = get()._findMessageIndexById(
          currentMessages,
          messageId,
        );

        const currentMessage = currentMessages[currentMessageIdx];
        if (!isEmpty(extend)) {
          for (const key in extend)
            currentMessage.messageState[key] = extend[key];

          currentMessages.splice(currentMessageIdx, 1, currentMessage);
          get().updateCurrentSession((session) => {
            session.messages = currentMessages;
          });
          return;
        }
        // console.log('currentMessage', currentMessage)
        if (currentMessage && currentMessage.messageState) {
          currentMessage.messageState.isRead = true;
        }
        currentMessages.splice(currentMessageIdx, 1, currentMessage);

        get().updateCurrentSession((session) => {
          session.messages = currentMessages;
        });
      },
      async startGame(params: any, isRenderDialog = false) {
        return fetch(getUrl(`${DIA_GO_API_URL}/api/open/rpggo/startgame`), {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: any) => {
            // console.log("[Games] started game from server", res);
            let { code, data } = res;
            if (code !== 0) return;
            if (isEmpty(data)) throw new Error("Failed to start game");
            const chapter = data.chapter || {};
            const characters = data.chapter?.characters || [];
            const currentCharacter = characters?.[0] || {};

            if (isEmpty(currentCharacter)) {
              console.error("[Games] failed to get a character");
              return;
            }

            set(() => ({
              game: {
                ...{
                  ...get().game,
                  chapter,
                  currentCharacter,
                  characters,
                },
                state: GAME_STATE.inProgress,
              },
              currentChapterId: data.chapter.chapter_id,
            }));

            get().updateCurrentSession((session) => {
              session.gameState = GAME_STATE.inProgress;
              session.chapterId = data.chapter.chapter_id;
            });

            if (isRenderDialog) get().initialDialog();
          })
          .catch(() => {
            console.error("[Games] failed to start game");
            return Promise.reject("game error!!!");
          })
          .finally(() => {
            fetchState = 2;
          });
      },
      async getGame(params: any) {
        set({
          gameProgress: {
            ...get().gameProgress,
            page: 1,
          },
        });
        params.gameId = params.gameId.trim();
        // clear last game data
        set(() => ({ game: createEmptyGame() }));
        return fetch(getUrl(`${DIA_GO_API_URL}/api/open/rpggo/gameinfo`), {
          method: "POST",
          body: JSON.stringify(params),
          headers: {
            ...getHeaders(),
          },
        })
          .then((res) => res.json())
          .then((res: any) => {
            let { code, data } = res;
            // 这里需要改造 fix：header不刷新
            if (code !== 0) {
              const game = {
                state: 0,
                publishState: PublishState.unpublished,
                errorCode: code,
              };
              set(() => ({ game }));
              return game;
            }
            if (isEmpty(data)) throw new Error("Failed to start game");
            const { chapterId } = getSearchParams();
            const chapter = get().getChapterById(data.chapters, chapterId);
            const characters = chapter?.characters || [];
            const currentCharacter = characters?.[0] || {};
            if (isEmpty(currentCharacter)) {
              showToast("[Games] failed to get a character!");
              console.error("[Games] failed to get a character");
              return;
            }

            const game = {
              ...data,
              chapter,
              currentCharacter,
              characters,
              state: params.creatorUpdate
                ? GAME_STATE.inProgress
                : GAME_STATE.waitStart,
            };
            set(() => ({ game }));

            const isRenderDialog = !params.creatorUpdate;
            if (isRenderDialog) get().initialDialog(null, "getGame");
            return game;
          })
          .catch(() => {
            console.error("[Games] failed to start game");
            const game = createEmptyGame();
            set(() => ({ game }));
            return Promise.reject("Failed to get game info");
          })
          .finally(() => {
            fetchState = 2;
          });
      },

      setCurrentCharacter(character: any) {
        // @ts-ignore
        set(() => ({ game: { ...get().game, currentCharacter: character } }));
      },
      getCharacterById(characterId: string): CHARACTER {
        const allCharacters = get()
          .game.chapters.flatMap((chapter) => chapter.characters || [])
          .reduce((acc, character) => {
            if (!acc.find((c) => c.id === character.id)) {
              acc.push(character);
            }
            return acc;
          }, []);

        return (
          // @ts-ignore
          allCharacters?.find(
            (character: CHARACTER) => character.id === characterId,
          ) || {}
        );
      },
      finish() {
        set(() => ({ game: { ...get().game, state: GAME_STATE.finished } }));
      },
      getChapterById(chapters, chapterId) {
        if (chapterId) {
          set(() => ({ currentChapterId: chapterId }));
          return (
            chapters?.find(
              (chapter: CHARACTER) => chapter.chapter_id === chapterId,
            ) || chapters[0]
          );
        }
        set(() => ({ currentChapterId: chapters[0].chapter_id }));
        return chapters[0];
      },
    };

    return methods;
  },
  {
    name: StoreKey.Chat,
  },
);
