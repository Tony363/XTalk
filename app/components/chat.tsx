/* eslint-disable react-hooks/exhaustive-deps */
// @ts-nocheck
"use client";
import "../styles/chat.scss";
import { useUserStore } from "@/app/store/user";
import React, { useEffect, useRef, useState, useMemo } from "react";
import isEmpty from "lodash/isEmpty";
import { Else, If, Then } from "react-if";
import classnames from "classnames";
import Locale from "../locales";
import styles from "./chat.module.scss";
import mobileStyles from "./mobileStyles.module.scss";
import { getSearchParams } from "@/app/utils/url";
import { GameErrorPage } from "./unpublished-tips";
import { useMobileScreen } from "../utils";
import { prettyObject } from "../utils/format";
import { showToast } from "./ui-lib";
import { toast } from "@/app/utils/toast";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { useChatStore, PublishState, GAME_STATE } from "../store";
import { useAudioPlayer } from "@/app/hooks/use-audioPlayer";
import { useTranslation } from "react-i18next";
import {
  DEFAULT_SOURCE,
  REQUEST_TIMEOUT_MS,
  RPGGO_URL,
  UNFINISHED_INPUT,
  GAME_DEFAULT_BG,
  DISCORD_URL,
} from "@/app/constant";
import { FrostedGlass } from "./frosted-glass";
import { ChatContent } from "./chat-content";
import { ChatHome as _ChatHome } from "./tabs/detail";
const ChatHome = React.memo(_ChatHome);
import { Task } from "./tabs";
import detailStyles from "./tabs/detail/index.module.scss";
import {
  MenuIcon,
  MusicIcon,
  TaskIcon,
  ProgressIcon,
  MobileNavIcon,
} from "../icons/detail-icons";
import { useParams } from "next/navigation";
import { Loading } from "./ui-lib";

type ChatProps = {
  gameId: string;
};

function _Chat(props: ChatProps) {
  const { gameId = "" } = props;

  const chatStore = useChatStore();
  const userStore = useUserStore();
  const session = chatStore.currentSession();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [userInput, setUserInput] = useState("");
  const isMobileScreen = useMobileScreen();

  useEffect(() => {
    chatStore.updateCurrentSession((session) => {
      const stopTiming = Date.now() - REQUEST_TIMEOUT_MS;
      session.messages.forEach((m) => {
        // check if should stop all stale messages
        if (m.isError || new Date(m.date).getTime() < stopTiming) {
          if (m.streaming) {
            m.streaming = false;
          }

          if (m.content.length === 0) {
            m.isError = true;
            m.content = prettyObject({
              error: true,
              message: "empty response",
            });
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // remember unfinished input
  useEffect(() => {
    // try to load from local storage
    const key = UNFINISHED_INPUT(session.id);
    const mayBeUnfinishedInput = localStorage.getItem(key);
    if (mayBeUnfinishedInput && userInput.length === 0) {
      setUserInput(mayBeUnfinishedInput);
      localStorage.removeItem(key);
    }

    const dom = inputRef.current;
    return () => {
      localStorage.setItem(key, dom?.value ?? "");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isWaitStart = chatStore.game.state === GAME_STATE.waitStart;

  const {
    clearSessions,
    newSession,
    currentSession,
    startGame,
    currentChapterId,
    game,
    drawerConfig,
    setDrawerConfig,
    continuingGame,
    deleteSession,
    isNSFWGame,
    isSoloNpc,
    isPlotGame,
    isGGIntroduceShow,
    setIsGGIntroduceShow,
  } = chatStore;

  // initDrawer
  useEffect(() => {
    setDrawerConfig({ isShow: true, currentTab: "MENU" });
  }, []);

  // mobile set default show
  useEffect(() => {
    if (isMobileScreen && isEmpty(chatStore.drawerConfig.currentTab)) {
      setDrawerConfig({ isShow: true, currentTab: "MENU" });
    }
  }, [isMobileScreen]);

  const drawerContentProps = useMemo(
    () => ({
      gameId: gameId,
      isNSFWGame: isNSFWGame(),
      isSoloNpc: isSoloNpc(),
      isPlotGame: isPlotGame(),
      user: userStore.user,
      gameInfo: game,
      currentChapterId,
      isWaitStart,
      clearSessions,
      newSession,
      currentSession,
      startGame,
      drawerConfig,
      setDrawerConfig,
      continuingGame,
      deleteSession,
      isGGIntroduceShow,
      setIsGGIntroduceShow,
    }),
    [
      gameId,
      isNSFWGame,
      userStore.user,
      game,
      currentChapterId,
      isWaitStart,
      clearSessions,
      newSession,
      currentSession,
      startGame,
      drawerConfig,
      setDrawerConfig,
      continuingGame,
      deleteSession,
      isGGIntroduceShow,
      setIsGGIntroduceShow,
    ],
  );

  const mobileSwiperRef = useRef(null);

  const DrawerContent = useMemo(
    () => (
      <ChatHome
        {...drawerContentProps}
        mobileSwiperRef={mobileSwiperRef}
      ></ChatHome>
    ),
    [drawerContentProps],
  );

  const tabsList = useMemo(() => {
    const tabs = [
      {
        type: "MENU",
        icon: MenuIcon,
        content: DrawerContent,
      },
      {
        type: "BGM",
        click: () => {},
      },
    ];

    return tabs;
  }, [isWaitStart]);

  // 任务面板是否显示
  const [isTaskHasChildren, setTaskHasChildren] = useState(true);
  const [isConditionHasChildren, setConditionHasChildren] = useState(true);

  useEffect(() => {
    const tasks = game?.chapter?.goals?.[0]?.subgoals?.filter(
      (subgoal) => !!subgoal?.subgoal,
    );
    const failure = game?.chapter?.goals?.[1]?.subgoals?.filter((subgoal) => {
      return (
        subgoal.goal_anchor?.[0]?.anchor_name &&
        subgoal.goal_anchor?.[0]?.affiliate_type
      );
    });
    if (game?.chapter?.goal_info?.no_goal) {
      setTaskHasChildren(false);
      setConditionHasChildren(false);
    } else {
      setTaskHasChildren(
        tasks?.length > 0 || game?.chapter?.goal_info?.goal_displayed,
      );
      setConditionHasChildren(failure?.length > 0);
    }
  }, [game?.chapter?.goals, game?.chapter?.goal_info]);

  return (
    <div className={styles.chat}>
      <If condition={chatStore.game.publishState === PublishState.unpublished}>
        <Then>
          <GameErrorPage errorCode={chatStore.game.errorCode} />
        </Then>
        <Else>
          <div className={styles["chat-body"]}>
            <SidebarTabContainer
              gameId={gameId}
              mobileSwiperRef={mobileSwiperRef}
              tabsList={tabsList}
              coverImage={chatStore.game.image || GAME_DEFAULT_BG}
              isMobileScreen={isMobileScreen}
              isWaitStart={isWaitStart}
              drawerConfig={drawerConfig}
              setDrawerConfig={setDrawerConfig}
              isGGIntroduceShow={isGGIntroduceShow}
              setIsGGIntroduceShow={setIsGGIntroduceShow}
              backgroundMusics={
                chatStore.game?.chapter?.background_musics ||
                chatStore.game?.background_musics ||
                []
              }
              isTaskHasChildren={isTaskHasChildren}
              isConditionHasChildren={isConditionHasChildren}
            >
              <ChatHome {...drawerContentProps}></ChatHome>
            </SidebarTabContainer>
            {!isMobileScreen && <ChatContent gameId={gameId} />}
          </div>
        </Else>
      </If>
    </div>
  );
}

function _SidebarTab({
  gameId,
  mobileSwiperRef,
  tabsList,
  coverImage,
  isMobileScreen,
  isWaitStart,
  drawerConfig,
  setDrawerConfig,
  backgroundMusics,
  isTaskHasChildren,
  isConditionHasChildren,
  children: menuContent,
  isGGIntroduceShow,
}) {
  const userStore = useUserStore();
  const chatStore = useChatStore();
  const hasBGM = !isEmpty(backgroundMusics);
  const [isTaskShow, setIsTaskShow] = useState(true);
  const [isConditionShow, setIsConditionShow] = useState(true);
  const defaultTabClick = (params: { type: "TASK" | "PROGRESS" }) => {
    const { type } = params;
    if (drawerConfig.isShow) {
      type === "TASK" ? setIsTaskShow(true) : setIsConditionShow(true);
    } else {
      type === "TASK"
        ? setIsTaskShow(!isTaskShow)
        : setIsConditionShow(!isConditionShow);
    }
    if (!isTaskHasChildren) {
      setIsTaskShow(false);
    }
    if (!isConditionHasChildren) {
      setIsConditionShow(false);
    }
    setDrawerConfig({ isShow: false });
  };
  const DEFAULT_TAB = [
    {
      type: "TASK",
      icon: TaskIcon,
      onClick: () => {
        if (drawerConfig.isShow) {
          setIsTaskShow(true);
        } else {
          setIsTaskShow(!isTaskShow);
        }
        setDrawerConfig({ isShow: false });
      },
    },
    {
      type: "PROGRESS",
      icon: ProgressIcon,
      onClick: () => {
        topIconClick();
        if (drawerConfig.isShow) {
          setIsConditionShow(true);
        } else {
          setIsConditionShow(!isConditionShow);
        }
        setDrawerConfig({ isShow: false });
      },
    },
  ];
  let cardWidth = 0;
  if (isEmpty(drawerConfig.currentTab))
    cardWidth = isTaskHasChildren || isConditionHasChildren ? 428 : 0;
  else cardWidth = 528;
  if (!isTaskShow && !isConditionShow && isEmpty(drawerConfig.currentTab))
    cardWidth = 0;
  const [mobileFirstRender, setMobileFirstRender] = useState(false);

  const getIdxByName = (name) => {
    const swiper = mobileSwiperRef?.current.swiper;
    const index = swiper.slides.findIndex(
      (slide) => slide.getAttribute("data-name") === name,
    );
    return index;
  };
  const [currentMobildTabIdx, setCurrentMobildTabIdx] = useState(0);

  const { from } = getSearchParams();
  useEffect(() => {
    if (isMobileScreen) setCurrentMobildTabIdx(getIdxByName("SETTING"));
  }, []);
  const MOBILE_DEFAULT_TAB = [
    {
      type: "TASK",
      icon: MobileNavIcon.Task,
    },
    {
      type: "CHAT",
      icon: MobileNavIcon.Chat,
    },
    {
      type: "SETTING",
      icon: MobileNavIcon.Setting,
    },
  ];

  // mobile set default show
  useEffect(() => {
    if (isMobileScreen && isEmpty(drawerConfig.currentTab)) {
      slideByName("CHAT");
    }
  }, [isMobileScreen]);

  const slideByName = (name) => {
    const index = getIdxByName(name);
    if (index !== -1) mobileSwiperRef.current.swiper.slideTo(index);
  };

  const filterTabs = () => {
    let tabs = [...DEFAULT_TAB];
    if (!isTaskHasChildren) {
      tabs = tabs.filter((tab) => tab.type !== "TASK");
    }
    if (!isConditionHasChildren) {
      tabs = tabs.filter((tab) => tab.type !== "PROGRESS");
    }
    return tabs;
  };

  const [defaultTabs, setDefaultTabs] = useState(filterTabs());
  useEffect(() => {
    setDefaultTabs(filterTabs());
    // 这里要更新swiper的ref
    mobileSwiperRef.current?.swiper?.update();
  }, [isTaskHasChildren, isConditionHasChildren]);

  if (!isMobileScreen) {
    return (
      <aside className={styles["chat-detail"]}>
        {/* navigation bar */}
        <div className={styles["chat-siderbar"]}>
          <div className={detailStyles.siderbar}>
            <If condition={defaultTabs.length > 0}>
              <Then>
                <div>
                  {defaultTabs.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <div
                        key={item.type}
                        event="click"
                        category="sidebar_tab"
                        value={item.type}
                        label="toggle sidebar tab"
                        className={detailStyles.menubutton}
                        onClick={() => defaultTabClick({ type: item.type })}
                      >
                        <IconComp
                          isAcitve={
                            item.type === "TASK" ? isTaskShow : isConditionShow
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              </Then>
            </If>

            <div>
              {tabsList.map((item, index) => {
                const IconComp = item.icon;
                const isCheckCurrentTab =
                  drawerConfig.isShow && drawerConfig.currentTab === item.type;
                if (item.type === "BGM" && !hasBGM) return null;
                return (
                  <div
                    event="click"
                    category="sidebar_tab"
                    value={item.type}
                    label="toggle sidebar tab"
                    key={index}
                    className={classnames(detailStyles.menubutton, {
                      [detailStyles.active]: isCheckCurrentTab,
                    })}
                    onClick={() => {
                      if (item.type === "GGPLUS") {
                        userStore.hideGGTipsIcon();
                      }
                      if (item.click) {
                        item.click();
                        return;
                      }
                      if (isCheckCurrentTab) setDrawerConfig({ isShow: false });
                      else
                        setDrawerConfig({
                          isShow: true,
                          currentTab: item.type,
                        });
                    }}
                  >
                    {item.type === "BGM" && hasBGM && (
                      <BgmPlayBtn bgm={backgroundMusics} />
                    )}
                    {item.type !== "BGM" && (
                      <IconComp isAcitve={isCheckCurrentTab} />
                    )}
                    {item.type === "GGPLUS" && userStore.isShowGGTipsIcon && (
                      <div className={detailStyles.menuTips}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={classnames(styles["chat-detail-bg"], {
            [styles["no-detail-img"]]: isEmpty(drawerConfig.currentTab),
          })}
        >
          <img src={coverImage} />
        </div>
        <div
          style={{ width: `${cardWidth}px` }}
          className={classnames(styles["chat-detail-aniWrap"], {
            [styles["chat-detail-ani-Put"]]: !drawerConfig.isShow,
          })}
        >
          <div
            className={classnames(styles["chat-detail-card"], {
              [styles["no-detail-color"]]: isEmpty(drawerConfig.currentTab),
            })}
          >
            <div className={detailStyles.detail}>
              {
                <div
                  className={classnames("fade", {
                    ["fade-visible"]: "" === drawerConfig.currentTab,
                    ["fade-invisible"]: "" !== drawerConfig.currentTab,
                  })}
                >
                  <Task
                    isTaskShow={isTaskShow}
                    isConditionShow={isConditionShow}
                    isMobileScreen={isMobileScreen}
                    isTaskHasChildren={isTaskHasChildren}
                    isConditionHasChildren={isConditionHasChildren}
                  ></Task>
                </div>
              }
              {tabsList?.map((item) => (
                <div
                  key={item.type}
                  className={classnames("fade", {
                    ["fade-visible"]: item.type === drawerConfig.currentTab,
                    ["fade-invisible"]: item.type !== drawerConfig.currentTab,
                  })}
                >
                  {/* {item.content} */}
                  {/* @TODO: 当时调continue时候menuContent未更新，观察一下 */}
                  {/*  prosp - [setIsConfirmOpen] 未更新 */}
                  {item.type === "MENU" ? menuContent : item.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    );
  } else {
    return (
      <div className={mobileStyles["game-container"]}>
        {!isGGIntroduceShow && (
          <div className={mobileStyles["game-header"]}>
            <FrostedGlass
              url={coverImage}
              classname={mobileStyles["game-container-bg"]}
              backgroundColor={"rgba(0, 0, 0, 0.7)"}
            />
            <div className={mobileStyles["game-nav"]}>
              {MOBILE_DEFAULT_TAB.map((n, idx) => {
                if (!isTaskHasChildren && idx === 0) return;
                const navIcon = n.icon;
                return (
                  <div
                    event="click"
                    category="header_swiper_tab"
                    value={n.type}
                    label="toggle nav tab"
                    key={n.type}
                    className={classnames(mobileStyles["game-nav-item"], {
                      [mobileStyles["active"]]: idx === currentMobildTabIdx,
                    })}
                    onClick={() => {
                      setCurrentMobildTabIdx(idx);
                      // mobileSwiperRef.current.swiper.slideTo(idx);
                      slideByName(n.type);
                    }}
                  >
                    {navIcon}
                    <span
                      className={mobileStyles["active-border-bottom"]}
                    ></span>
                    {n.type === "TASK" && (
                      <div className={mobileStyles.menuTips}></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <Swiper
          speed={500}
          spaceBetween={10}
          effect="slide"
          observer={true}
          observeParents={true}
          className={mobileStyles["game-body"]}
          ref={mobileSwiperRef}
          initialSlide={MOBILE_DEFAULT_TAB.length}
          onSlideChange={(swiper) => {
            setCurrentMobildTabIdx(swiper.activeIndex);

            // 检查是否从第二个幻灯片滑动到第一个幻灯片
            if (!isTaskHasChildren && swiper.activeIndex === 0) {
              swiper.slideTo(1);
            }
            if (!mobileFirstRender && swiper.activeIndex === 1) {
              setMobileFirstRender(true);
            }
          }}
        >
          <SwiperSlide data-name={"TASK"}>
            <Task
              isTaskShow={isTaskShow}
              isConditionShow={isConditionShow}
              isMobileScreen={isMobileScreen}
              isTaskHasChildren={isTaskHasChildren}
              isConditionHasChildren={isConditionHasChildren}
            ></Task>
          </SwiperSlide>

          <SwiperSlide data-name={"CHAT"}>
            {mobileFirstRender && <ChatContent gameId={gameId}></ChatContent>}
          </SwiperSlide>

          <SwiperSlide data-name={"SETTING"}>
            <div
              className={classnames(styles["chat-detail-card"], {
                [styles["no-detail-color"]]: isEmpty(drawerConfig.currentTab),
              })}
            >
              {drawerConfig.currentTab === "MENU" && (
                <div
                  className={
                    mobileStyles[
                      ("game-container-bg", "game-container-bg-menu")
                    ]
                  }
                >
                  <img src={coverImage} alt="" />
                  {/* @TODO:    */}
                  {!isGGIntroduceShow && (
                    <div
                      className={classnames(detailStyles.siderbar, {
                        [detailStyles.shareHide]:
                          chatStore.drawerConfig.currentTab === "SHARE",
                      })}
                    >
                      {tabsList.map((item, index) => {
                        const IconComp = item.icon;
                        const isCheckCurrentTab =
                          drawerConfig.isShow &&
                          drawerConfig.currentTab === item.type;
                        if (item.type === "BGM" && !hasBGM) return null;
                        // disable menu button on mobile
                        if (item.type === "MENU" && isMobileScreen) return null;
                        return (
                          <div
                            event="click"
                            category="sidebar_tab"
                            value={item.type}
                            label="toggle sidebar tab"
                            key={index}
                            className={classnames(detailStyles.menubutton, {
                              [detailStyles.active]: isCheckCurrentTab,
                            })}
                            onClick={() => {
                              if (item.click) {
                                item.click();
                                return;
                              }
                              if (isCheckCurrentTab) return;
                              else
                                setDrawerConfig({
                                  isShow: true,
                                  currentTab: item.type,
                                });
                            }}
                          >
                            {item.type === "BGM" && hasBGM && (
                              <BgmPlayBtn bgm={backgroundMusics} />
                            )}
                            {item.type !== "BGM" && (
                              <IconComp isAcitve={isCheckCurrentTab} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              <FrostedGlass
                isWrapperHasBg={drawerConfig.currentTab === "MENU"}
                url={coverImage}
                classname={classnames(mobileStyles["game-container-bg"], {
                  [mobileStyles["mobile-border-header"]]:
                    drawerConfig.currentTab === "MENU",
                  [mobileStyles["mobile-gg-tips"]]: isGGIntroduceShow,
                })}
                backgroundColor={"rgba(0, 0, 0, 0.6)"}
              />

              <div
                className={classnames(detailStyles.detail, {
                  [mobileStyles["mobile-border-header"]]:
                    drawerConfig.currentTab === "MENU",
                  [mobileStyles["mobile-gg-tips"]]: isGGIntroduceShow,
                })}
              >
                {tabsList?.map((item) => (
                  <div
                    // style={{height: item.type === 'MENU' ? 'calc(100% - 25rem)': '100%'}}
                    key={item.type}
                    className={classnames("fade", {
                      ["fade-visible"]: item.type === drawerConfig.currentTab,
                      ["fade-invisible"]: item.type !== drawerConfig.currentTab,
                      ["fade-menu"]: item.type === "MENU" && !isGGIntroduceShow,
                      ["fade-menu-scroll"]:
                        item.type === "MENU" && from === "creator",
                    })}
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    );
  }
}

const SidebarTabContainer = React.memo(_SidebarTab);

function _BgmPlayBtn({ bgm }) {
  const { t } = useTranslation();

  const [bgmUrl] = bgm;
  const { play, pause, isPlaying } = useAudioPlayer(bgmUrl, false);
  // @TODO 音频逻辑替换howler
  useEffect(() => {
    window.isAutoPlayer = false;
    const handleClick = () => {
      if (!isPlaying && !window.isAutoPlayer) {
        play();
        toast(t("CommonUi.BGMOn"));
        window.isAutoPlayer = true;
      }
    };
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div
      className={classnames(detailStyles.menubutton, detailStyles.musicbutton)}
      onClick={() => {
        if (isPlaying) {
          pause();
          toast(t("CommonUi.BGMOff"));
        } else {
          play();
          toast(t("CommonUi.BGMOn"));
        }
      }}
    >
      <MusicIcon isPlaying={isPlaying} />
    </div>
  );
}

export const BgmPlayBtn = React.memo(_BgmPlayBtn);
export function Chat() {
  // chat init
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const routerParams = useParams();
  const gameId =
    routerParams?.gameId || routerParams?.characterId || routerParams?.cid;
  const chapterId = routerParams?.chapterId;
  const [isGameInfoReady, setIsGameInfoReady] = useState(false);

  useEffect(() => {
    if (!gameId) {
      localStorage.clear();
      showToast(Locale.System.Game.Get);
      const REDIRECT_AFTER = 0;
      setTimeout(() => {
        window.location.href = RPGGO_URL;
      }, REDIRECT_AFTER);
      return;
    }
    //
    chatStore.clearInvalidSessions();
    chatStore.newSession(false);
    const { id: sessionId } = chatStore.currentSession();

    // if (!userStore.authenticated) {
    //   return chatStore.gameInfo({ gameId });
    // }

    const params = {
      sessionId,
      gameId,
      source: DEFAULT_SOURCE,
    };
    // chatStore.startGame(params);
    chatStore
      .getGame(params)
      .then((data) => {
        const { image } = data || {};
        if (image) {
          document.body.style.backgroundImage = `url('${image}')`;
        } else document.body.style.backgroundImage = `url(${GAME_DEFAULT_BG})`;
        setIsGameInfoReady(true);
      })
      .catch((error) => {
        showToast(Locale.System.Game.Get);
      });

    return () => {
      chatStore.clearSessions();
    };
  }, [gameId, chapterId]);

  if (isEmpty(chatStore.game)) return null;
  if (!isGameInfoReady) return <Loading />;
  else return <_Chat key={gameId} gameId={gameId}></_Chat>;
}
