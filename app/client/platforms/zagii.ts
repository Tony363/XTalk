import {
  DEFAULT_SOURCE,
  DIA_GO_API_URL,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";
import {
  MESSAGE_ROLE,
  useAppConfig,
  useChatStore,
  createSystemMessage,
  SYSTEM_MESSAGE_TYPE,
} from "@/app/store";

import { ChatOptions, getHeaders, LLMApi } from "../api";
import Locale from "../../locales";
import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { CHAT_CODE, GAME_ACTION } from "@/app/client/constants";
import isEmpty from "lodash/isEmpty";
import { getUrl } from "@/app/utils/url";
import { makePayload } from "@/app/utils/token";
import * as Sentry from "@sentry/nextjs";

export const messageState = {
  isRead: false,
  isGetNextMessage: false,
  isGeneratedPicture: false,
};

export interface OpenAIListModelResponse {
  object: string;
  data: Array<{
    id: string;
    object: string;
    root: string;
  }>;
}

const EVENT_TYPE = {
  data: "data",
  fin: "fin",
};

export class ZagiiApi implements LLMApi {
  replyPreCheck(code: number, message: string, options: any) {
    if (code === GAME_ACTION.BALANCE_NOT_ENOUGH) {
      options.onFinish(message);
    } else {
      options.onFinish(message);
    }
  }
  reply(data: any, options: ChatOptions) {
    const {
      result = {},
      code = 0,
      game_status: gameStatus,
      transaction_details: transactionDetails = {},
      msg = "",
      sessionId = "",
      userId = "",
      debug_info: debugInfo = "",
    } = data;
    const {
      action,
      chapter_id: chapterId,
      game_id: gameId,
      action_message: actionMessage = "",
      goal = {},
    } = gameStatus || {};

    // extReplyContent when next scene is emit
    let {
      text: replyContent = "",
      action_list: actionList = [],
      image = "",
      text_ext: extReplyContent = "",
      character_type: characterType = "",
      log_id: logId = "",
    } = result || {};

    const responseCode = Number(code);
    if (!isEmpty(transactionDetails)) {
      options.onUpdateTransactionDetails(transactionDetails);
    }

    // need restart
    if (responseCode === CHAT_CODE.needRestart) {
      // DM reply
      return options.onFinish(Locale.Chat.Reply.Tip.restart_tip);
    }

    if (responseCode === CHAT_CODE.unkonwn) {
      console.error("error is 150");
      return options.onFinish(Locale.Chat.Reply.Error.common);
    }

    // win dm
    if (responseCode === CHAT_CODE.win) {
      options.onFinish(Locale.Chat.Reply.Tip.win, {
        role: MESSAGE_ROLE.system,
      });
      options.onUpdateGameState?.({ action: GAME_ACTION.END });
      return;
    }

    // bot not in this game
    if (responseCode === CHAT_CODE.botNotExist) {
      // character reply
      return options.onFinish(Locale.Chat.Reply.Tip.npc_not_exist);
    }

    // llm limit
    if (responseCode === CHAT_CODE.llmLimit) {
      // dm reply
      return options.onFinish(msg || Locale.Chat.Reply.Error.llmLimit);
    }

    // win
    if (action === GAME_ACTION.END) {
      useChatStore.setState({
        currentChapterId: "",
        currentTimestamp: Date.now(),
      });
      let replyText = "";
      if (!isEmpty(actionMessage)) {
        replyText = `${actionMessage}`;
      }
      options.onNextMessage(replyText || Locale.Chat.Reply.Tip.win, {
        logId,
        role: MESSAGE_ROLE.system,
        systemMessage: createSystemMessage({
          onlyKey: `${chapterId}_${GAME_ACTION.END}`,
          title: replyContent,
          description: replyText,
          type: SYSTEM_MESSAGE_TYPE.finish,
          action: GAME_ACTION.END,
        }),
      });
      options.onUpdateGameState?.({ action: GAME_ACTION.END });
      options.onStopAll(Locale.Chat.Reply.Tip.win);
      return;
    }

    // actionList 仅用于npc的文本消息回复
    if (action === GAME_ACTION.CURRENT || action === GAME_ACTION.NEXT_GOAL) {
      const isActionListEmpty = isEmpty(actionList);
      if (isEmpty(replyContent)) return;
      // console.log("这里是对话", actionList);
      if (options.isIntercept) {
        if (image) console.log("【intercept  picture", image);
        else console.log("【intercept text msg", replyContent);
        return;
      }
      const isPricture = characterType === "picture_produce_dm";
      if (isPricture) {
        if (isEmpty(image)) return;
        options.onNextMessage(replyContent, {
          logId,
          role: MESSAGE_ROLE.system,
          messageState,
          systemMessage: createSystemMessage({
            type: SYSTEM_MESSAGE_TYPE.picture,
            image,
            description: replyContent,
            debugInfo,
          }),
        });
        return;
      }
      // const restart = false;
      return options.onNextMessage(
        // isActionListEmpty ? replyContent : actionList,
        replyContent,
        options,
      );
    }

    if (action === GAME_ACTION.NEXT_SCENE) {
      useChatStore.setState({
        currentChapterId: chapterId,
        currentTimestamp: Date.now(),
      });
      let replyText = "";
      if (!isEmpty(actionMessage)) {
        replyText = `${actionMessage}`;
      }
      const params = {
        sessionId,
        gameId,
        chapterId,
        userId,
        source: DEFAULT_SOURCE,
        nextChapter: true,
      };

      options.onNextMessage(replyText || Locale.Chat.Reply.Tip.win, {
        logId,
        role: MESSAGE_ROLE.system,
        messageState,
        systemMessage: createSystemMessage({
          onlyKey: `${chapterId}_${GAME_ACTION.NEXT_SCENE}`,
          title: replyContent,
          description: replyText,
          type: SYSTEM_MESSAGE_TYPE.finish,
        }),
      });
      options.onUpdateGameState?.({
        ...params,
        action: GAME_ACTION.NEXT_SCENE,
      });
      options.onStopAll(Locale.Chat.Reply.Tip.win);
      return;
    }

    // bad ending
    if (action === GAME_ACTION.FAIL_END) {
      useChatStore.setState({
        currentChapterId: "",
        currentTimestamp: Date.now(),
      });

      let replyText = goal?.chapter_tip?.closing_statement;
      options.onNextMessage(replyText || Locale.Chat.Reply.Tip.win, {
        logId,
        role: MESSAGE_ROLE.system,
        systemMessage: createSystemMessage({
          onlyKey: `${chapterId}_${GAME_ACTION.FAIL_END}`,
          title: replyContent,
          description: replyText,
          type: SYSTEM_MESSAGE_TYPE.gameover,
          action: GAME_ACTION.END,
        }),
      });
      // use end, mark as end
      options.onUpdateGameState?.({ action: GAME_ACTION.END });
      options.onStopAll(Locale.Chat.Reply.Tip.win);
      return;
    }

    return replyContent;
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      id: v?.id,
      role: v?.role,
      content: v.content,
      type: v?.type,
    }));

    const modelConfig = {
      ...useAppConfig.getState().modelConfig,
      ...{
        model: options.config.model,
      },
    };

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      presence_penalty: modelConfig.presence_penalty,
      frequency_penalty: modelConfig.frequency_penalty,
      top_p: modelConfig.top_p,
      // max_tokens: Math.max(modelConfig.max_tokens, 1024),
      // Please do not ask me why not send max_tokens, no reason, this param is just shit, I dont want to explain anymore.
    };

    // console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream || true;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      // make a fetch request
      const requestTimeoutId = setTimeout(() => {
        // send error message after timeout
        return controller.abort();
      }, REQUEST_TIMEOUT_MS);
      const { sessionId, user, character, game, userVoice = "" } = options;
      const messageContent = messages[messages.length - 1];
      const chatParams = {
        game_id: game?.id,
        character_id: character?.id,
        message: messageContent.content,
        user_id: user?.id,
        back_push: false,
        session_id: sessionId,
        message_id: messageContent?.id, // user's message id
        type: messageContent.type,
        user_voice: userVoice,
        advance_config: {
          enable_image_streaming: true,
        },
      };

      const headers = {
        // "Application-ID": getHeaderConfig()?.k1,
        "Content-Type": "application/json",
        // Authorization: `Bearer ${getHeaderConfig()?.k2}`,
        payload: makePayload(chatParams),
      };

      // const chatPath = `${getHeaderConfig()?.k3}/v2/open/game/chatsse`;
      const chatPath = `/api/open/chatsse`;
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(chatParams),
        signal: controller.signal,
        headers,
      };

      if (shouldStream) {
        let responseText = "";
        let remainText = "";
        let finished = false;

        // animate response to make it looks smooth
        function animateResponseText() {
          if (finished || controller.signal.aborted) {
            responseText += remainText;
            console.log("[Response Animation] finished");
            return;
          }

          if (remainText.length > 0) {
            const fetchCount = Math.max(1, Math.round(remainText.length / 60));
            const fetchText = remainText.slice(0, fetchCount);
            responseText += fetchText;
            remainText = remainText.slice(fetchCount);
            options.onUpdate?.(responseText, fetchText);
          }

          requestAnimationFrame(animateResponseText);
        }

        // start animaion
        animateResponseText();

        const finish = () => {
          if (!finished) {
            finished = true;
            // options.onFinish(responseText + remainText);
          }
        };

        controller.signal.onabort = finish;

        fetchEventSource(chatPath, {
          ...chatPayload,
          async onopen(res) {
            clearTimeout(requestTimeoutId);
            const contentType = res.headers.get("content-type");

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [responseText];
              let extraInfo = await res.clone().text();
              try {
                const resJson = await res.clone().json();
                extraInfo = JSON.stringify(resJson);
              } catch {}

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              responseText = responseTexts.join("\n\n");

              return finish();
            }
          },
          onmessage: ({ data, event }) => {
            try {
              if (isEmpty(event) || isEmpty(data)) {
                // options.onFinish(Locale.Chat.Reply.Error.common);
                return;
              }
              // console.log(data, event);
              const res = JSON.parse(data) as any;
              const { code, message, data: response = {} } = res;
              if (event === "err") {
                this.replyPreCheck(code, message, options);
                return;
              }

              this.updateGameStatus(response.game_status);
              const {
                character_id: nextCharacterId = "",
                log_id: logId,
                message_id: messageId = "",
              } = response.result || {};
              const { chapter_id: currentChapterId } = response.game_status;
              if (code !== 200 || isEmpty(response)) {
                Sentry.captureException(
                  JSON.stringify({
                    data,
                  }),
                  {
                    tags: {
                      customTag: "chat-sse-response",
                    },
                  },
                );
              }
              if (event === EVENT_TYPE.data) {
                const isDifferentChater =
                  useChatStore.getState().currentChapterId != currentChapterId;
                const isInvalid =
                  useChatStore.getState().currentTimestamp < Date.now();
                const isIntercept = isDifferentChater && isInvalid;
                this.reply(
                  { ...response, code, sessionId, userId: user?.id },
                  {
                    ...options,
                    nextCharacterId,
                    isIntercept,
                    logId,
                    chapterId: currentChapterId,
                    messageId,
                  },
                );
                return;
              }
              if (event === EVENT_TYPE.fin) {
                finish();
                return;
              }
              // console.log("data", event, gameStatus, result);
            } catch (e) {
              Sentry.captureException(e, {
                tags: {
                  customTag: "chat-sse-onmessage",
                },
              });
              // console.error("[Request] parse error", event, data);
              options.onFinish(Locale.Chat.Reply.Error.common);
            }
          },
          onclose() {
            finish();
          },
          onerror(e) {
            if (e instanceof TypeError) {
              options.onFinish("Network Error.");
            } else {
              Sentry.captureException(e, {
                tags: {
                  customTag: "chat-sse-onerror",
                },
              });
              throw e;
            }
            throw e;
          },
          openWhenHidden: true,
        });
      } else {
        const res = await fetch(
          getUrl(`${DIA_GO_API_URL}/api/open/rpggo/chat`),
          {
            method: "POST",
            body: JSON.stringify(chatParams),
            signal: controller.signal,
            headers: {
              ...getHeaders(),
            },
          },
        );
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        const { data, code } = resJson;

        if (code !== 0 || isEmpty(data)) {
          console.error("error is 513");
          options.onFinish(Locale.Chat.Reply.Error.common);
          return;
        }
        this.reply({ ...data, sessionId, userId: user?.id }, options);
        this.updateGameStatus(data);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      // options.onError?.(e as Error);
      if (e instanceof TypeError) {
        options.onFinish(Locale.Chat.Reply.Error.networkError);
      } else {
        options.onFinish(Locale.Chat.Reply.Error.common);
      }
    }
  }

  private updateGameStatus(
    data: { displayed_status: Record<string, any> } | any,
  ) {
    // @ts-ignore
    useChatStore.getState().updateCurrentSession((session) => {
      session.gameDisplayStatus = {
        // @ts-ignore
        ...useChatStore.getState().currentSession().gameDisplayStatus,
        ...data.displayed_status,
      };
      session.goalStatus = data?.goal?.goals_status?.length
        ? data.goal.goals_status
        : // @ts-ignore
          useChatStore.getState().currentSession().goalStatus;
    });
  }
}
