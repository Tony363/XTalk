// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";

import styles from "./chat.module.scss";

export function GameErrorPage(props: { errorCode: string }) {
  const START_DURATION = 7;
  const END_DURATION = 0;
  const [countdown, setCountdown] = useState(START_DURATION);
  const timerRef = useRef<NodeJS.Timeout>();
  const { t } = useTranslation();
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleButtonClick = useCallback(() => {
    window.location.replace("/");
    clearInterval(timerRef.current);
    document.body.style.backgroundImage = null;
  }, []);

  useEffect(() => {
    if (countdown <= END_DURATION) handleButtonClick();
  }, [countdown, handleButtonClick]);
  return (
    <div className={styles["game-home"]}>
      <div className={styles[`game-info-tips`]}>
        <div className={styles[`game-info-tips-title`]}>
          {t(`ForbiddenAccess.${props.errorCode}`)}
        </div>
        <div className={styles[`game-info-tips-description`]}>
          {t("ForbiddenAccess.Description")}
        </div>
        <div
          className={styles[`game-info-tips-backButton`]}
          onClick={handleButtonClick}
        >
          {t("ForbiddenAccess.BackToLobby")}（
          <p className={styles[`game-info-tips-countNum`]}>{countdown}</p>s）
        </div>
      </div>
    </div>
  );
}
