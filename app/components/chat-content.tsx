// @ts-nocheck
import { gsap } from "gsap";
import isEmpty from "lodash/isEmpty";
import { useDebouncedCallback } from "use-debounce";
import { useScrollToBottom } from "../utils/dom";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Avatar } from "./emoji";
import { PictureView as _PictureView } from "@/app/components/chat/picView";
const PictureView = React.memo(_PictureView);
import { Nickname } from "@/app/components/ui/nickname";
import { Else, If, Then } from "react-if";
import LoadingIcon from "../icons/three-dots.svg";
import dynamic from "next/dynamic";
import { useUserStore } from "@/app/store/user";
import styles from "./chat.module.scss";
import { GAME_DEFAULT_BG } from "../constant";
import { ChatControllerPool } from "../client/controller";
import { showRestartConfirm } from "@/app/components/ui-lib";
import { ShareIcon } from "../icons/detail-icons";
import {
  ChatMessage,
  createMessage,
  GAME_STATE,
  MESSAGE_ROLE,
  SubmitKey,
  useAppConfig,
  useChatStore,
  SYSTEM_MESSAGE_TYPE,
} from "../store";
import { getAcronym } from "../utils/format";
import { GAME_ACTION } from "@/app/client/constants";
import { CHAT_PAGE_SIZE, LAST_INPUT_KEY } from "../constant";
import { autoGrowTextArea, selectOrCopy, useMobileScreen } from "../utils";
import classnames from "classnames";
import { MessagePlayIcon } from "../icons/detail-icons";
import { useAudioPlayer } from "@/app/hooks/use-audioPlayer";
import { useTranslation } from "react-i18next";
import markdownToText from "markdown-to-text";

const Markdown = dynamic(async () => (await import("./markdown")).Markdown, {
  loading: () => <LoadingIcon />,
});

function _MessagePlayButton({
  backgroundAudio,
  className,
}: {
  backgroundAudio: string;
  className: string;
}) {
  const [isImagesReady, setIsImagesReady] = useState(false);
  const { play, pause, isPlaying } = useAudioPlayer(backgroundAudio);
  const frameCount = 61;
  const urls = new Array(frameCount)
    .fill()
    .map(
      (o, i) =>
        `https://storage.googleapis.com/rpggo_images/diago/decibels/${
          i + 1
        }.png`,
    );
  let animationTimeline;
  preloadImages(urls, (images) => {
    setIsImagesReady(true);
    if (!isImagesReady) {
      animationTimeline = setupAnimation(images, "#play-sequence");
      animationTimeline.play();
    }
  });
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <div className="cursor-pointer" onClick={isPlaying ? pause : play}>
          <MessagePlayIcon isPlaying={isPlaying}></MessagePlayIcon>
        </div>
        <canvas
          width={300}
          height={24}
          style={{ opacity: isPlaying ? 1 : 0 }}
          id="play-sequence"
        ></canvas>
      </div>
    </div>
  );
}
export const MessagePlayButton = React.memo(_MessagePlayButton);

function _NPCPlayButton({
  backgroundAudio,
  isUser,
}: {
  backgroundAudio: string;
  isUser?: boolean;
}) {
  const { play, pause, isPlaying } = useAudioPlayer(backgroundAudio);
  return (
    <div
      className={classnames("cursor-pointer", {
        [[styles["chat-audio-user"]]]: isUser,
      })}
      onClick={isPlaying ? pause : play}
    >
      <MessagePlayIcon isPlaying={isPlaying}></MessagePlayIcon>
    </div>
  );
}
export const NPCPlayButton = React.memo(_NPCPlayButton);

export function ChatContent(props: { gameId: string; mobileSwiperRef: any }) {
  const { t } = useTranslation();
  const { scrollRef, setAutoScroll, scrollDomToBottom } = useScrollToBottom();
  type RenderMessage = ChatMessage & {
    preview?: boolean;
  };

  const chatStore = useChatStore();
  const session = chatStore.currentSession();
  const config = useAppConfig();
  const fontSize = config.fontSize;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { shouldSubmit } = useSubmitHandler();
  const isMobileScreen = useMobileScreen();
  const context: RenderMessage[] = [];
  const userStore = useUserStore();

  // auto grow input
  const [inputRows, setInputRows] = useState(1);
  const measure = useDebouncedCallback(
    () => {
      const rows = inputRef.current ? autoGrowTextArea(inputRef.current) : 1;
      const inputRows = Math.min(4, Math.max(1, rows));
      setInputRows(inputRows);
    },
    100,
    {
      leading: true,
      trailing: true,
    },
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(measure, [userInput]);

  // only search prompts when user input is short
  const onInput = (text: string) => {
    setUserInput(text);
  };
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isPictureDisabled, setIsPictureDisabled] = useState(false);
  const inputTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pictureTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const doSubmit = (userInput: string, options = {} as any) => {
    if (userInput.trim() === "") return;
    if (isButtonDisabled) return;
    setIsButtonDisabled(true);
    setIsLoading(true);
    const { id: sessionId } = useChatStore.getState().currentSession();
    const inputParams = {
      content: userInput,
      character: chatStore.game.currentCharacter,
      sessionId,
      user: userStore.user,
      toUser: chatStore.game.currentCharacter,
      game: chatStore.game,
    };
    chatStore
      .onUserInput(inputParams, useChatStore)
      .then(() => setIsLoading(false));
    localStorage.setItem(LAST_INPUT_KEY, userInput);
    setUserInput("");
    if (!isMobileScreen) inputRef.current?.focus();
    setAutoScroll(true);
    inputTimeoutRef.current = setTimeout(() => {
      setIsButtonDisabled(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (inputTimeoutRef.current) {
        clearTimeout(inputTimeoutRef.current);
      }
      if (pictureTimeoutRef.current) {
        clearTimeout(pictureTimeoutRef.current);
      }
    };
  }, []);

  // stop response
  const onUserStop = (messageId: string) => {
    ChatControllerPool.stop(session.id, messageId);
  };

  // preview messages
  const renderMessages = useMemo(() => {
    return context.concat(session.messages as RenderMessage[]).concat(
      isLoading
        ? [
            {
              ...createMessage({
                role: "assistant",
                content: "……",
              }),
              preview: true,
            },
          ]
        : [],
    );
  }, [
    // config.sendPreviewBubble,
    context,
    isLoading,
    session.messages,
    // userInput,
  ]);

  const [msgRenderIndex, _setMsgRenderIndex] = useState(
    Math.max(0, renderMessages.length - CHAT_PAGE_SIZE),
  );

  function setMsgRenderIndex(newIndex: number) {
    newIndex = Math.min(renderMessages.length - CHAT_PAGE_SIZE, newIndex);
    newIndex = Math.max(0, newIndex);
    _setMsgRenderIndex(newIndex);
  }

  const messages = useMemo(() => {
    const endRenderIndex = Math.min(
      msgRenderIndex + 3 * CHAT_PAGE_SIZE,
      renderMessages.length,
    );
    return renderMessages.slice(msgRenderIndex, endRenderIndex);
  }, [msgRenderIndex, renderMessages]);

  // check if should send message
  const onInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if ArrowUp and no userInput, fill with last input
    if (
      e.key === "ArrowUp" &&
      userInput.length <= 0 &&
      !(e.metaKey || e.altKey || e.ctrlKey)
    ) {
      setUserInput(localStorage.getItem(LAST_INPUT_KEY) ?? "");
      e.preventDefault();
      return;
    }
    if (shouldSubmit(e)) {
      doSubmit(userInput);
      e.preventDefault();
    }
  };
  const onRightClick = (e: any, message: ChatMessage) => {
    // copy to clipboard
    if (selectOrCopy(e.currentTarget, message.content)) {
      if (userInput.length === 0) {
        setUserInput(message.content);
      }

      e.preventDefault();
    }
  };
  const onChatBodyScroll = (e: HTMLElement) => {
    const bottomHeight = e.scrollTop + e.clientHeight;
    const edgeThreshold = e.clientHeight;

    const isTouchTopEdge = e.scrollTop <= edgeThreshold;
    const isTouchBottomEdge = bottomHeight >= e.scrollHeight - edgeThreshold;
    const isHitBottom =
      bottomHeight >= e.scrollHeight - (isMobileScreen ? 4 : 10);

    const prevPageMsgIndex = msgRenderIndex - CHAT_PAGE_SIZE;
    const nextPageMsgIndex = msgRenderIndex + CHAT_PAGE_SIZE;

    if (isTouchTopEdge && !isTouchBottomEdge) {
      setMsgRenderIndex(prevPageMsgIndex);
    } else if (isTouchBottomEdge) {
      setMsgRenderIndex(nextPageMsgIndex);
    }

    setAutoScroll(isHitBottom);
  };

  function scrollToBottom() {
    setMsgRenderIndex(renderMessages.length - CHAT_PAGE_SIZE);
    scrollDomToBottom();
  }

  useEffect(() => {
    const handleCountdownEnd = (event) => {
      chatStore.updateCurrentMessage(event.detail.messageId);
    };
    window.addEventListener("countdownEnd", handleCountdownEnd);
    return () => {
      window.removeEventListener("countdownEnd", handleCountdownEnd);
    };
  }, []);

  const [isFooterBar, setIsFooterBar] = useState(false);

  const autoFocus = !isMobileScreen; // wont auto focus on mobile screen

  useEffect(() => {
    const autoPlayFn = () => {
      if (window.isCutAutoScroll) return;
      scrollDomToBottom();
    };
    window.removeEventListener("typewriterTyping", autoPlayFn);
    window.addEventListener("typewriterTyping", autoPlayFn);
  }, []);

  const [checkStyle, setCheckStyle] = useState(false);
  const { id: sessionId, chapterId } = useChatStore.getState().currentSession();

  return (
    <section className={styles["chat-content"]}>
      <div
        id="chatMessageScrollBody"
        className={`${styles["chat-messages"]}`}
        ref={scrollRef}
        onScroll={(e) => onChatBodyScroll(e.currentTarget)}
        onWheel={() => (window.isCutAutoScroll = true)}
        onMouseDown={() => inputRef.current?.blur()}
        onTouchStart={() => {
          window.isCutAutoScroll = true;
          inputRef.current?.blur();
          setAutoScroll(false);
        }}
      >
        <div
          className={classnames(styles["security-wrap"], {
            [styles.soloCharacter]: chatStore.isSoloNpc(),
          })}
        >
          {messages
            .filter((message, index, self) => {
              const isSystem = message?.role === MESSAGE_ROLE.system;
              const onlyKeyExists = message?.systemMessage?.onlyKey;
              return (
                !isSystem ||
                !onlyKeyExists ||
                index ===
                  self.findIndex(
                    (m) =>
                      m?.systemMessage?.onlyKey ===
                      message?.systemMessage?.onlyKey,
                  )
              );
            })
            .map((message = {}, i) => {
              if (isEmpty(message)) return;
              const isUser = message?.role === "user";
              const isSystem = message?.role === MESSAGE_ROLE.system;
              let systemMessage = {};
              if (isSystem) {
                systemMessage = message?.systemMessage;
              }
              const isValidessage =
                message?.originId &&
                !isEmpty(getContentToString(message?.content));

              const currentCid = systemMessage.chapterId || "";
              const isActiveChapter = (cid: string) => cid === currentCid;

              const backgroundAudio = systemMessage.backgroundAudio;

              const isWelcomeMessage =
                systemMessage?.type === SYSTEM_MESSAGE_TYPE.welcome;
              const isFinishMessage =
                systemMessage?.type === SYSTEM_MESSAGE_TYPE.finish;
              const isGameOverMessage =
                systemMessage?.type === SYSTEM_MESSAGE_TYPE.gameover;
              const isPictureMessage =
                systemMessage?.type === SYSTEM_MESSAGE_TYPE.picture;
              const messageState = Object.assign(message.messageState, {
                messageId: message.id,
              });

              const isGameEndAction = [
                GAME_ACTION.FAIL_END,
                GAME_ACTION.END,
              ].includes(message.systemMessage?.action);

              const { user } = message;
              const isContext = i < context.length;
              const showTyping = message.preview || message.streaming;

              return (
                <Fragment key={message.id}>
                  {/* <div style={{fontSize: 12, color: '#fff'}}>
                  {JSON.stringify(message)}
                </div> */}
                  <If condition={isSystem}>
                    <Then>
                      <div
                        className={classnames(
                          styles["chat-message"],
                          styles["chat-message-system"],
                        )}
                      >
                        <div className={styles["chat-message-container"]}>
                          {showTyping && (
                            <div className={styles["chat-message-status"]}>
                              {/*{Locale.Chat.Typing}*/}
                            </div>
                          )}
                          <div
                            className={classnames(
                              styles["chat-message-item"],
                              styles["chat-welcome-message"],
                              {
                                [styles["chat-picture-message"]]:
                                  isPictureMessage,
                              },
                            )}
                          >
                            {/* 这里是系统欢迎和结束 */}
                            {isWelcomeMessage && (
                              <>
                                <div
                                  className={classnames(
                                    styles["chat-message-system-header"],
                                    {
                                      [styles["start"]]: isWelcomeMessage,
                                      [styles["no-mb20"]]:
                                        !systemMessage.description,
                                    },
                                  )}
                                >
                                  <p className={styles["chapter-title"]}>
                                    {t("Dialogue.CHAPTER")}
                                  </p>
                                  <p className={styles["title"]}>
                                    {systemMessage?.title}
                                  </p>
                                </div>
                                <div className={styles["chapter-wrapper"]}>
                                  <div className={styles["chapter-steps"]}>
                                    {chatStore.game.chapters?.map((item) => {
                                      return (
                                        <div
                                          className={classnames(
                                            styles["chapter-steps-items"],
                                            {
                                              [styles["chapter-steps-active"]]:
                                                isActiveChapter(
                                                  item.chapter_id,
                                                ),
                                            },
                                          )}
                                          key={item.chapter_id}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </>
                            )}
                            {isWelcomeMessage && backgroundAudio && (
                              <MessagePlayButton
                                className={styles["chat-message-system-bgm"]}
                                backgroundAudio={backgroundAudio}
                              />
                            )}
                            {isGameOverMessage && (
                              <div
                                className={styles["chat-message-system-header"]}
                              >
                                <p className={styles[("flag", "skull")]}></p>
                                <p className={styles["title"]}>
                                  {t("Dialogue.GameOver")}
                                </p>
                                <div className={styles["finish-text"]}>
                                  {/* {systemMessage?.title}
                                <div className={styles["line"]}>
                                  <p className={styles["circle"]}></p>
                                </div> */}
                                </div>
                              </div>
                            )}

                            {isFinishMessage && (
                              <div
                                className={styles["chat-message-system-header"]}
                              >
                                <p className={styles["flag"]}></p>
                                <p className={styles["title"]}>
                                  {t("Dialogue.Congratulations")}
                                </p>
                                <div className={styles["finish-text"]}>
                                  {systemMessage?.title}
                                  <div className={styles["line"]}>
                                    <p className={styles["circle"]}></p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {isPictureMessage && (
                              <PictureView
                                isVertical={
                                  chatStore.isSoloNpc() ||
                                  chatStore.isNSFWGame()
                                }
                                isRead={message?.messageState.isRead}
                                url={systemMessage?.image}
                                messageId={message.id}
                                debugInfo={systemMessage.debugInfo}
                                thumbnail={
                                  chatStore.game.image || GAME_DEFAULT_BG
                                }
                              />
                            )}
                            {/* <span style={{color: "yellow"}}>{JSON.stringify(message.logId)}</span> */}
                            <Markdown
                              systemMessageType={systemMessage?.type}
                              updateCurrentMessage={
                                chatStore.updateCurrentMessage
                              }
                              messageState={messageState}
                              content={systemMessage?.description || ""}
                              loading={
                                (message.preview || message.streaming) &&
                                message.content?.length === 0 &&
                                !isUser
                              }
                              // onContextMenu={(e) => onRightClick(e, message)}
                              onDoubleClickCapture={() => {
                                if (!isMobileScreen) return;
                                // setUserInput(message.content);
                              }}
                              fontSize={fontSize}
                              parentRef={scrollRef}
                              defaultShow={i >= messages?.length - 6}
                            />
                            <div style={{ color: "#fff" }}></div>
                            {isGameEndAction && (
                              <div className={styles.gameOverBtns}>
                                <div
                                  className={styles.gameOverShare}
                                  onClick={() => {
                                    if (
                                      chatStore.drawerConfig.currentTab ===
                                      "SHARE"
                                    ) {
                                      chatStore.setDrawerConfig({
                                        isShow: false,
                                      });
                                    } else {
                                      chatStore.setDrawerConfig({
                                        isShow: true,
                                        currentTab: "SHARE",
                                      });
                                    }
                                  }}
                                >
                                  <ShareIcon isAcitve={false}></ShareIcon>
                                </div>
                                <div
                                  className={styles.gameOverRestart}
                                  onClick={() => {
                                    showRestartConfirm();
                                  }}
                                >
                                  {t("Detail.Restart")}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Then>
                    <Else>
                      <div
                        className={
                          isUser
                            ? styles["chat-message-user"]
                            : styles["chat-message-npc"]
                        }
                      >
                        <div className={styles["chat-message-container"]}>
                          <div className={styles["chat-message-header"]}>
                            {!isUser && (
                              <div className={styles["chat-message-avatar"]}>
                                <Avatar
                                  showOrigin={true}
                                  avatar={user?.avatar}
                                  name={getAcronym(user?.name)}
                                />
                              </div>
                            )}
                          </div>
                          {showTyping && (
                            <div className={styles["chat-message-status"]}>
                              {/*{Locale.Chat.Typing}*/}
                            </div>
                          )}
                          <div className={styles["chat-message-wrap"]}>
                            {!isUser && (
                              <div className="flex items-center">
                                <Nickname
                                  name={user?.name}
                                  className={styles["user-nickname"]}
                                />
                              </div>
                            )}
                            <div className={styles["chat-message-item"]}>
                              <Markdown
                                messageState={messageState}
                                updateCurrentMessage={
                                  chatStore.updateCurrentMessage
                                }
                                content={getContentToString(message.content)}
                                loading={
                                  (message.preview || message.streaming) &&
                                  message.content.length === 0
                                }
                                // onContextMenu={(e) => onRightClick(e, message)}
                                onDoubleClickCapture={() => {
                                  if (!isMobileScreen) return;
                                  // setUserInput(message.content);
                                }}
                                fontSize={fontSize}
                                parentRef={scrollRef}
                                defaultShow={i >= messages.length - 6}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Else>
                  </If>
                </Fragment>
              );
            })}
        </div>
      </div>
      {![GAME_STATE.waitStart].includes(chatStore.game.state) && (
        <div
          id="posterdom-filter"
          className={classnames(
            styles[("security-wrap", "chat-input-panel")],
            "posterdom-filter",
          )}
        >
          {chatStore.game.state !== GAME_STATE.finished && (
            <>
              {chatStore.isPlotGame() && (
                <div className={styles["chat-characters-wrap"]}>
                  {chatStore.game.characters && !isFooterBar && (
                    <div className={classnames(styles["chat-characters"])}>
                      {chatStore.game.characters?.map((character) => {
                        const { id, name, avatar = "" } = character;
                        return (
                          <div
                            key={id}
                            onClick={() => {
                              chatStore.setCurrentCharacter(character);
                            }}
                            className={classnames(
                              {
                                [styles["chat-character-current"]]:
                                  chatStore?.game.currentCharacter?.id === id,
                              },
                              styles["chat-character"],
                            )}
                          >
                            <Avatar avatar={avatar} name={getAcronym(name)} />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.chatInputWrapper}>
                <>
                  <label className={styles.centerContent}>
                    <textarea
                      ref={inputRef}
                      className={styles["chat-input"]}
                      placeholder={`${t("Input.Placeholder")(
                        chatStore.game?.currentCharacter?.name,
                      )}...`}
                      onInput={(e) => onInput(e.currentTarget.value)}
                      value={userInput}
                      onKeyDown={onInputKeyDown}
                      onFocus={() => {
                        setCheckStyle(true);
                        scrollToBottom();
                      }}
                      onBlur={() => {
                        setCheckStyle(false);
                      }}
                      onClick={() => {
                        window.isCutAutoScroll = false;
                        scrollToBottom();
                      }}
                      rows={inputRows}
                      autoFocus={autoFocus}
                      style={{
                        fontSize: config.fontSize,
                      }}
                    />
                  </label>
                  <div className={styles.rightSendIcon}>
                    <div
                      className={classnames(
                        styles["chat-input-send"],
                        styles["button-padding-11"],
                      )}
                      onClick={
                        !isMobileScreen ? () => doSubmit(userInput) : () => {}
                      }
                      onTouchEnd={
                        isMobileScreen ? () => doSubmit(userInput) : () => {}
                      }
                    ></div>
                  </div>
                </>
              </div>
            </>
          )}
        </div>
      )}
      <div className={styles.compliantTips}>
        Remember all contents generated are made up of AI.
      </div>
    </section>
  );
}

function useSubmitHandler() {
  const config = useAppConfig();
  const submitKey = config.submitKey;
  const isComposing = useRef(false);

  useEffect(() => {
    const onCompositionStart = () => {
      isComposing.current = true;
    };
    const onCompositionEnd = () => {
      isComposing.current = false;
    };

    window.addEventListener("compositionstart", onCompositionStart);
    window.addEventListener("compositionend", onCompositionEnd);

    return () => {
      window.removeEventListener("compositionstart", onCompositionStart);
      window.removeEventListener("compositionend", onCompositionEnd);
    };
  }, []);

  const shouldSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return false;
    if (e.key === "Enter" && (e.nativeEvent.isComposing || isComposing.current))
      return false;
    return (
      (config.submitKey === SubmitKey.AltEnter && e.altKey) ||
      (config.submitKey === SubmitKey.CtrlEnter && e.ctrlKey) ||
      (config.submitKey === SubmitKey.ShiftEnter && e.shiftKey) ||
      (config.submitKey === SubmitKey.MetaEnter && e.metaKey) ||
      (config.submitKey === SubmitKey.Enter &&
        !e.altKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.metaKey)
    );
  };

  return {
    submitKey,
    shouldSubmit,
  };
}

function preloadImages(urls, callback) {
  let loaded = 0;
  const images = [];
  urls.forEach((url, index) => {
    const img = new Image();
    img.onload = () => {
      images[index] = img;
      loaded++;
      if (loaded === urls.length) {
        callback(images);
      }
    };
    img.src = url;
  });
}

function setupAnimation(images, canvasSelector) {
  const canvas = document.querySelector(canvasSelector);
  const ctx = canvas?.getContext("2d");
  const timeline = gsap.timeline({
    paused: true,
    repeat: -1,
  });

  images.forEach((img, index) => {
    timeline.to(
      {},
      {
        duration: 0.05,
        onStart: () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        },
      },
    );
  });

  return timeline;
}

function getContentToString(content) {
  if (typeof content === "undefined") return "";
  if (typeof content === "string") return content;
  if (isEmpty(content)) return content;
  const assembledText = content
    .map((item) => {
      if (item.type === "action") {
        return `*(${item.text})*`;
      } else {
        return item.text;
      }
    })
    .join(" ");
  return assembledText;
}

function filterAction(content) {
  const noActionContent = content
    .replace(/\*.*?\*/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\n/g, "")
    .trim();
  console.log(markdownToText(noActionContent));
  return markdownToText(noActionContent);
}

function getContentToTTS(content) {
  if (typeof content === "string") return filterAction(content);
  const filteredDialogues = content.filter((item) => item.type === "dialogue");
  const assembledText = filteredDialogues.map((item) => item.text).join(". ");
  return markdownToText(assembledText);
}
