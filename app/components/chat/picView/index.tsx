"use client";
import styles from "./index.module.scss";
import React, { useState, useEffect } from "react";
import { CanvasCircleAnimation } from "@/app/components/button/count";
const CanvasCircleAnimationMeno = React.memo(CanvasCircleAnimation);
import LoadingIcon from "../../../icons/three-dots.svg";
const duration = 15000;
import { useTranslation } from "react-i18next";
import { isFormal } from "@/app/utils/runtime-env";
import classNames from "classnames";
import dynamic from "next/dynamic";
const ReactJson = dynamic(() => import("react-json-view"), { ssr: false });
import { PicviewStatus } from "@/app/constant";
interface PictureViewProps {
  isVertical: boolean;
  isRead: boolean;
  url: string;
  messageId: string;
  debugInfo: Object;
  thumbnail: string;
}

export function PictureView({
  isVertical,
  isRead,
  url,
  messageId,
  debugInfo = {},
  thumbnail,
}: PictureViewProps) {
  const [isDebugShow, setIsDebugShow] = useState(false);
  const [picviewStatus, setPicviewStatus] = useState(PicviewStatus.Loading);
  const isLoaded = useImageLoader(url);

  useEffect(() => {
    if (isRead) setPicviewStatus(PicviewStatus.Expired);
  }, [isRead]);

  useEffect(() => {
    if (picviewStatus === PicviewStatus.Expired) return;
    if (url === PicviewStatus.Loading) setPicviewStatus(PicviewStatus.Loading);
    if (url === PicviewStatus.Error) setPicviewStatus(PicviewStatus.Error);
  }, [url]);

  useEffect(() => {
    if (picviewStatus === PicviewStatus.Expired) return;
    if (isLoaded) setPicviewStatus(PicviewStatus.Preview);
  }, [isLoaded]);

  const toggleDebugInfo = () => {
    if (!isFormal()) setIsDebugShow(!isDebugShow);
  };
  return (
    <div
      className={classNames(styles["pic-preview"], {
        [styles["no-margin-btm"]]:
          PicviewStatus.Error === picviewStatus ||
          (PicviewStatus.Loading === picviewStatus &&
            url === PicviewStatus.Loading),
      })}
      onClick={() => toggleDebugInfo()}
    >
      <div className={styles["pic-preview-content"]}>
        {picviewStatus === PicviewStatus.Loading && (
          <>
            <div
              className={classNames(styles.thumbnail, {
                [styles["scale-3-4"]]: isVertical,
                [styles["scale-4-3"]]: !isVertical,
              })}
            >
              <img src={thumbnail} alt="" />
            </div>
            <div className={styles["loading-icon"]}>
              <LoadingIcon />
            </div>
          </>
        )}

        {picviewStatus === PicviewStatus.Preview && (
          <>
            <CanvasCircleAnimationMeno
              duration={duration}
              messageId={messageId}
            />
            <img src={url} alt="" />
          </>
        )}

        {picviewStatus === PicviewStatus.Expired && (
          <>
            <ExpiredView />
          </>
        )}

        {picviewStatus === PicviewStatus.Error && (
          <>
            <ErrorView />
          </>
        )}
      </div>

      {isDebugShow && (
        <span className={styles["pic-debug"]}>
          <ReactJson
            style={{ backgroundColor: "rgba(255, 255, 255, .6)" }}
            src={debugInfo}
          />
        </span>
      )}
    </div>
  );
}

function ExpiredView() {
  const { t } = useTranslation();
  return (
    <div className={styles["pic-expired"]}>
      <div className={styles["pic-expired-content"]}>
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 16C20 18.2091 18.2091 20 16 20C13.7909 20 12 18.2091 12 16C12 12.5 15 12 15.5 9C17 11 17.5 12 17 15C18.9336 15 18.5 12 18.5 12C18.5 12 20 13.7909 20 16Z"
            fill="white"
            fillOpacity="0.32"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M3 1C1.89543 1 1 1.89543 1 3V6.38908L3.74264 3.64645L4.09619 3.29289L4.44974 3.64645L7.93003 7.12673L10.4103 4.64645L10.7639 4.29289L11.1174 4.64645L13.2442 6.77328L12.5371 7.48038L10.7639 5.70711L8.63713 7.83383L11.0254 10.2221L10.3183 10.9292L4.09619 4.70711L1 7.8033V15C1 16.1046 1.89543 17 3 17H11.0998C11.0344 16.6772 11 16.343 11 16.0008C11 13.8859 11.9437 12.6543 12.8068 11.6584C12.8781 11.5761 12.9479 11.4962 13.0161 11.4181C13.7763 10.5477 14.335 9.90787 14.5136 8.83644L14.8978 6.53125L16.3 8.40084C16.559 8.74621 16.7926 9.09457 17 9.44564V3C17 1.89543 16.1046 1 15 1H3Z"
            fill="white"
            fillOpacity="0.32"
          />
        </svg>
        <span>{t("Dialogue.Expired")}</span>
      </div>
    </div>
  );
}
function ErrorView() {
  const { t } = useTranslation();
  return (
    <div className={styles["pic-expired"]}>
      <div className={styles["pic-expired-content"]}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M1.59998 4.80156C1.59998 3.03425 3.03266 1.60156 4.79998 1.60156H24C25.7673 1.60156 27.2 3.03425 27.2 4.80156V15.1146V16.2708C26.4959 16.0939 25.7589 16 25 16C20.0294 16 16 20.0294 16 25C16 25.7595 16.0941 26.497 16.2712 27.2016H4.79998C3.03266 27.2016 1.59998 25.7689 1.59998 24.0016V12.486L6.55359 7.53241L16.5089 17.4877L17.6403 16.3564L13.8201 12.5361L17.2222 9.13398L20.0595 11.9712L21.1908 10.8398L17.7879 7.43692L17.2222 6.87123L16.6565 7.43692L12.6887 11.4048L7.11927 5.83536L6.55359 5.26967L5.9879 5.83536L1.59998 10.2233V4.80156Z"
            fill="white"
            fill-opacity="0.32"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M32 25C32 28.866 28.866 32 25 32C21.134 32 18 28.866 18 25C18 21.134 21.134 18 25 18C28.866 18 32 21.134 32 25ZM23.6069 21.4962C23.5491 20.6877 24.1894 20 25 20C25.8106 20 26.4509 20.6877 26.3931 21.4962L26.0712 26.0025C26.0311 26.5646 25.5634 27 25 27C24.4366 27 23.9689 26.5646 23.9288 26.0025L23.6069 21.4962ZM25 30C25.5523 30 26 29.5523 26 29C26 28.4477 25.5523 28 25 28C24.4477 28 24 28.4477 24 29C24 29.5523 24.4477 30 25 30Z"
            fill="white"
            fill-opacity="0.32"
          />
        </svg>
        <span>{t("Dialogue.ImageFailed")}</span>
      </div>
    </div>
  );
}

function useImageLoader(url: string) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!url) {
      setIsLoaded(false);
      return;
    }
    const image = new Image();
    image.src = url;
    image.onload = () => {
      setIsLoaded(true);
    };

    return () => {
      image.onload = () => {};
    };
  }, [url]);

  return isLoaded;
}
