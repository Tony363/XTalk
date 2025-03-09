// @ts-nocheck
import React, { useState, useEffect, useRef } from "react";
import "@/app/styles/chat.scss";
import detailStyles from "./index.module.scss";
import classnames from "classnames";
import {
  showRestartConfirm,
  showToast,
  showConfigToast,
  showGGToast,
} from "../../ui-lib";
import type { User } from "../../../store";
import { Avatar } from "../../emoji";
import { getAcronym } from "../../../utils/format";
import RestartIcon from "@/app/icons/restart.svg";
import { RemixIcon, PlayIcon } from "@/app/icons/detail-icons";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useMobileScreen } from "@/app/utils";
import Checkbox from "antd/es/checkbox/Checkbox";
import { If, Then } from "react-if";
import { getSearchParams } from "@/app/utils/url";
import { GAME_STATE } from "@/app/store";
import { useChatStore } from "@/app/store/chat";
export enum TWorldSaveSataus {
  saveing = "saveing",
  success = "success",
  fail = "fail",
}

export enum TPostTypes {
  worldSave = "worldSave",
}
export interface HomeProps {
  gameId: string;
  user: User;
  gameInfo: {
    image: string;
    name: string;
    intro: string;
    playedCount: number;
  };
}

export function ChatHome(props: HomeProps) {
  const {
    mobileSwiperRef,
    continuingGame,
    currentSession,
    startGame,
    gameId = "",
    user,
    gameInfo,
    setDrawerConfig,
    isNSFWGame,
  } = props;

  const chatStore = useChatStore();
  const currentChapterId = chatStore.currentChapterId;
  const isPlotGame = chatStore.isPlotGame();
  const isSoloNpc = chatStore.isSoloNpc();
  const isWaitStart = chatStore.game.state === GAME_STATE.waitStart;
  const isPlaying = !isWaitStart;

  const [disableStartButton, setDisableStartButton] = useState(false);
  const { id: userId, email: userEmail = "", authenticated } = user;
  const queryParams = useParams();
  let {
    image = "",
    name = "",
    intro = "",
    playedCount = 0,
    author = {},
    chapters = [],
    state = 0,
    isHasVoice,
  } = chatStore.game;
  // get all characters
  const characters = chapters
    .flatMap((chapter) => chapter.characters || [])
    .reduce((acc, character) => {
      if (!acc.find((c) => c.id === character.id)) {
        acc.push(character);
      }
      return acc;
    }, []);

  const { name: nickname, picture: avatar, user_id: authorUserId } = author;
  const isShowCreatorDebug = userId && authorUserId && userId === authorUserId;

  const [isRequired, setIsRequired] = useState(false);
  const isSecurityLevel = !isNSFWGame;
  const [isCheckLevel, setIsCheckLevel] = useState(isSecurityLevel);

  const containerRef = useRef(null);
  const [totalWidth, setTotalWidth] = useState(0);
  const [isShowMoreBtn, setisShowMoreBtn] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const spans = containerRef.current.querySelectorAll("span");
      const width = Array.from(spans).reduce(
        (acc, span) => acc + span.offsetWidth,
        0,
      );
      setTotalWidth(width);
    }
  }, [intro]);

  const onChangeCheckbox = (e) => {
    setIsCheckLevel(e.target.checked);
    if (e.target.checked) {
      setIsRequired(false);
    }
  };

  const startGameWithChapter = (chapter) => {
    setDisableStartButton(true);
    if (disableStartButton) return;
    const { newSession, deleteSession } = props;
    deleteSession();
    newSession(false, userId);
    const { id: sessionId } = currentSession();
    const { chapter_id: chapterId } = chapter;
    const params = {
      sessionId,
      gameId,
      chapterId,
      userId,
    };

    startGame(params, true)
      .catch((error) => {
        showToast(t("System.StartGame"));
      })
      .finally(() => {
        mobileSwiperRef.current.swiper.slidePrev();
        setDrawerConfig({ isShow: false, currentTab: "MENU" });
        setDisableStartButton(false);
      });
  };
  const isInternalUsers = authenticated && userEmail?.endsWith("@rpggo.ai");

  const handleConfirm = () => {
    const chapterId = queryParams?.chapterId;
    const { newSession, currentSession, startGame } = props;
    props.setIsConfirmOpen(false);
    newSession(false, userId);
    // @TODO： 未刷新
    const { id: sessionId } = currentSession();

    const params = {
      sessionId,
      gameId: props.gameId,
      chapterId,
      userId,
    };

    window.isCutAutoScroll = false;
    startGame(params, true)
      .catch((error) => {
        showToast(t("System.StartGame"));
      })
      .finally(() => {
        if (isMobileScreen) {
          mobileSwiperRef.current.swiper.slidePrev();
        } else setDrawerConfig({ isShow: false });
      });
  };
  const isContinue = chatStore.isContinue();

  const isMobileScreen = useMobileScreen();
  const { t } = useTranslation();

  const detailDomRef = useRef<HTMLDivElement>(null);

  const [isSetCenter, setIsSetCenter] = useState(false);
  const [isShowMore, setIsShowMore] = useState(false);

  const wrapperH = detailDomRef.current?.parentElement?.offsetHeight;
  const contentH = detailDomRef.current?.clientHeight;
  useEffect(() => {
    if (contentH < wrapperH) setIsSetCenter(true);
    else setIsSetCenter(false);
  }, [wrapperH, contentH]);

  useEffect(() => {
    const handleMessage = (event) => {
      // if (event.origin !== 'http://your-trusted-origin.com') {
      //     return;
      // }
      // console.log("postmessage-event", event);
      const { type, data } = event.data;
      if (type === TPostTypes.worldSave) {
        // console.log("Received save status:", data.status);
        const { id: sessionId } = currentSession();
        const params = {
          sessionId,
          gameId,
          userId,
          creatorUpdate: true,
        };

        if (data.status === TWorldSaveSataus.success) {
          showConfigToast(t("Creator.updating"));
          chatStore
            .getGame(params)
            .then((data) => {
              const { image } = data || {};
              if (image) {
                document.body.style.backgroundImage = `url(${image})`;
              } else {
                document.body.style.backgroundImage = `url(${GAME_DEFAULT_BG})`;
              }
              continuingGame();
              showConfigToast(t("Creator.updateComplete"));
            })
            .catch((error) => {
              // showToast(Locale.System.Game.Get);
            });
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const { from } = getSearchParams();
  useEffect(() => {
    if (from === "creator") handlePlayClick(true);
  }, []);

  function handlePlayClick(ignoreCheck) {
    // remove this later
    // if (!authenticated) {
    //   showLogin();
    //   return;
    // }
    // if (isTest() && !isInternalUsers) {
    //   showToast(t("CommonUi.EmailToast"));
    //   return;
    // }
    if (!ignoreCheck) {
      if (!isCheckLevel) {
        setIsRequired(true);
        return;
      }
    }

    if (isPlaying) return;

    // CONTINUE
    if (isContinue) {
      continuingGame();
      if (isMobileScreen) {
        if (from === "creator") {
          setTimeout(() => {
            mobileSwiperRef.current.swiper.slidePrev();
          }, 300);
        } else mobileSwiperRef.current.swiper.slidePrev();
      } else setDrawerConfig({ isShow: false });
      return;
    }

    const { id: sessionId } = currentSession();
    const chapterId = queryParams?.chapterId;
    const params = {
      sessionId,
      gameId,
      chapterId,
      userId,
    };

    window.isCutAutoScroll = false;
    setDisableStartButton(true);
    if (disableStartButton) return;

    startGame(params)
      .catch((error) => {
        showToast(t("System.StartGame"));
      })
      .finally(() => {
        if (isMobileScreen) {
          mobileSwiperRef.current.swiper.slidePrev();
        } else setDrawerConfig({ isShow: false });
        setDisableStartButton(false);
      });
  }
  return (
    <div
      ref={detailDomRef}
      className={classnames(detailStyles.detailBody, {
        [detailStyles.verticalCenter]:
          !isMobileScreen && isSoloNpc && isSetCenter,
      })}
    >
      {!chatStore.isGGIntroduceShow && (
        <>
          {isSoloNpc && (
            <>
              <div className={classnames(detailStyles["title"], "text-center")}>
                {name}
              </div>
              <div className={detailStyles.testAvatar}>
                <img src={image} alt="" />
              </div>
            </>
          )}
          {isPlotGame && (
            <h2 className={detailStyles["title"]}>{name || ""}</h2>
          )}
          <div className={detailStyles.descriptionWrap}>
            <p
              ref={containerRef}
              className={classnames(detailStyles["description"], {
                [detailStyles["hide"]]: !isShowMore,
              })}
              event="click"
              value="gameId=1"
              category="share_button"
              label="share_button-lobby-copy"
            >
              {intro?.split("").map((i, k) => {
                return <span key={k}>{i}</span>;
              })}
            </p>
            <div
              className={detailStyles.toggleBtn}
              onClick={() => setIsShowMore(!isShowMore)}
            >
              {totalWidth > containerRef?.current?.offsetWidth * 2 && (
                <img
                  className={classnames({
                    [detailStyles["rotate"]]: isShowMore,
                  })}
                  src="https://storage.googleapis.com/rpggo_images/diago/assets/gameinfo-intro-row.svg"
                  alt=""
                />
              )}
            </div>
          </div>

          <div className={classnames(detailStyles["btn-wrap"])}>
            {(isPlaying || isContinue) && (
              <RestartButton
                isPlaying={isPlaying}
                onClick={() => {
                  showRestartConfirm(mobileSwiperRef);
                }}
              />
            )}

            {isWaitStart && (
              <PlayButton
                onClick={() => handlePlayClick(false)}
                isContinue={isContinue}
                isWaitStart={isWaitStart}
              />
            )}
            {/* <RemixButton /> */}
          </div>
          {!isSecurityLevel && isWaitStart && (
            <div
              className={classnames(detailStyles["confirm-tips"], {
                [detailStyles.soloNpcBtn]: isSoloNpc,
              })}
            >
              <Checkbox onChange={onChangeCheckbox} className="confirm-check" />
              <span
                className={classnames(detailStyles["confirm-tips-text"], {
                  [detailStyles["confirm-tips-error"]]: isRequired,
                })}
              >
                {t("Detail.NSFWTips")}
              </span>
            </div>
          )}
          {isPlotGame && (
            <>
              <div className={detailStyles.chapters}>
                <div className={detailStyles["chapters-title"]}>
                  {t("Detail.Chapters")}
                </div>
                <div className={detailStyles["chapters-table"]}>
                  {chapters?.map((item, idx) => (
                    <div
                      className={classnames([
                        detailStyles["chapters-table-item"],
                        {
                          [detailStyles["author-self"]]: isShowCreatorDebug,
                          [detailStyles["active"]]:
                            item.chapter_id === currentChapterId,
                        },
                      ])}
                      key={item.chapter_id}
                      onClick={() => {
                        if (!isShowCreatorDebug) return;
                        startGameWithChapter(item);
                      }}
                    >
                      <span>{idx + 1}</span>
                      <h3>{item.name}</h3>
                      <If condition={isShowCreatorDebug}>
                        <Then>
                          <p className={detailStyles["icon"]}></p>
                        </Then>
                      </If>
                    </div>
                  ))}
                </div>
              </div>
              <div className={detailStyles.character}>
                <div className={detailStyles["character-title"]}>
                  <div>{t("Detail.Character")}</div>
                </div>
                <div className={detailStyles["character-list"]}>
                  {characters?.map((item) => (
                    <div
                      className={detailStyles["character-list-item"]}
                      key={item.id}
                    >
                      <Avatar
                        // showOrigin={true}
                        className={detailStyles["character-list-item-avatar"]}
                        avatar={item.avatar}
                        name={getAcronym(item.name)}
                      />
                      <span className="overflow-ellipsis">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function PlayButton(props: { onClick?: () => void; isWaitStart: boolean }) {
  const { t } = useTranslation();
  const isPlayling = !props.isWaitStart;
  const isContinue = props.isContinue;
  const btnText = isContinue ? t("Detail.Continue") : t("Detail.Play");
  return (
    <div
      className={classnames(detailStyles.play, {
        [detailStyles.disabled]: isPlayling,
        ["clickable"]: !isPlayling,
      })}
      onClick={props.onClick}
    >
      <PlayIcon isDisabled={isPlayling} />
      <span>{btnText}</span>
    </div>
  );
}

function RemixButton() {
  return (
    <div className={classnames(detailStyles.remix)}>
      <RemixIcon isDisabled={true} />
      <span>Remix</span>
    </div>
  );
}

function RestartButton(props: { onClick?: () => void; isPlaying: boolean }) {
  const { t } = useTranslation();
  return (
    <div
      className={classnames(detailStyles.restart, {
        [detailStyles.playing]: props.isPlaying,
      })}
      onClick={props.onClick}
    >
      <RestartIcon />
      {props.isPlaying && <span>{t("Detail.Restart")}</span>}
    </div>
  );
}
