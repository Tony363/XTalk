// @ts-nocheck
"use client";
import classnames from "classnames";
import styles from "./index.module.scss";
import { useMobileScreen } from "@/app/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";

interface ConfirmProps {
  confirmCallback?: Function;
  onClose?: any;
}

export function CommonConfirm({ confirmCallback, onClose }: ConfirmProps) {
  const { t } = useTranslation();
  const isMobileScreen = useMobileScreen();

  return (
    <div className={classnames(styles["dialog"], styles["dialog-enter"])}>
      <div className={styles[`dialog-content`]}>
        <div className={`${styles[`dialog-title`]} ${styles[`dialog-common`]}`}>
          You are accessing mature content
        </div>
        <div className={styles[`dialog-description`]}>
          This might include sensitive texts, images and audios. Confirm that
          you are suitable for the content.
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
            No
          </div>
          <div
            className={classnames(
              styles[`dialog-btns`],
              styles[`dialog-confirm`],
              "clickable",
            )}
            onClick={() => {
              confirmCallback();
              onClose();
            }}
          >
            Confirm
          </div>
        </div>
      </div>
    </div>
  );
}
