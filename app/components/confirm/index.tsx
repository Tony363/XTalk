// @ts-nocheck
"use client";
import classnames from "classnames";
import styles from "./index.module.scss";
import { useChatStore, useUserStore, User } from "@/app/store";
import { showToast } from "@/app/components/ui-lib";
import { getSearchParams } from "@/app/utils/url";
import { useMobileScreen } from "@/app/utils";
import { useTranslation } from "react-i18next";
import LoadingIcon from "@/app/icons/three-dots.svg";
import { useState } from "react";

interface ConfirmProps {
  swiper?: any;
  onClose?: any;
}

export function Confirm({ swiper, onClose }: ConfirmProps) {
  const { t } = useTranslation();
  const chatStore = useChatStore();
  const userStore = useUserStore();
  const isMobileScreen = useMobileScreen();

  const [isResatetLoading, setIsResatetLoading] = useState(false);
  const handleConfirm = () => {
    if (isResatetLoading) return;
    const { chapterId } = getSearchParams();
    const {
      newSession,
      currentSession,
      startGame,
      setDrawerConfig,
      setProressKey,
    } = chatStore;
    const userId = (userStore.user as User).id;
    newSession(false, userId);
    // @TODO： 未刷新
    const { id: sessionId } = currentSession();

    const params = {
      sessionId,
      gameId: chatStore.game.id,
      chapterId,
      userId,
    };

    window.isCutAutoScroll = false;
    setIsResatetLoading(true);
    let timer;
    setProressKey("");
    startGame(params, true)
      .catch((error) => {
        showToast(t("System.StartGame"));
      })
      .finally(() => {
        onClose();
        if (isMobileScreen && swiper) {
          swiper.current.swiper.slidePrev();
        } else setDrawerConfig({ isShow: false });
        timer = setTimeout(() => {
          clearTimeout(timer);
          setIsResatetLoading(false);
        }, 300);
      });
  };
  return (
    <div className={classnames(styles["dialog"], styles["dialog-enter"])}>
      <div className={styles[`dialog-content`]}>
        <div className={styles[`dialog-title`]}>
          {t("CommonUi.RestartTips")}
          {/* Are you sure want to restart <br /> the game? */}
        </div>
        <div className={styles[`dialog-description`]}>
          {t("CommonUi.RestartDes")}
        </div>
        <div className={styles[`dialog-btnwrap`]}>
          <div
            className={classnames(
              styles[`dialog-btns`],
              styles[`dialog-cancel`],
              "clickable",
            )}
            onClick={onClose}
          >
            {t("CommonUi.Cancel")}
          </div>
          <div
            className={classnames(
              styles[`dialog-btns`],
              styles[`dialog-confirm`],
              "clickable",
            )}
            onClick={handleConfirm}
          >
            {isResatetLoading ? <LoadingIcon /> : t("Detail.Restart")}
          </div>
        </div>
      </div>
    </div>
  );
}
