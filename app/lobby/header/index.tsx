import styles from "./index.module.scss";
import game from "./game.module.scss";
import footerStyles from "./../footer/index.module.scss";
import NavButton from "@/app/icons/nav.svg";
import LogoIcon from "@/app/icons/text-logo-alpha.svg";
import CloseIcon from "@/app/icons/close-icon.svg";
import TextLogoIcon from "@/app/icons/text-logo.svg";
import classnames from "classnames";
import {
  CREATOR_URL,
  DEVELOPER,
  ABOUT_URL,
  RPGGO_URL,
  DISCORD_URL,
} from "@/app/constant";
import { useUserStore } from "@/app/store/user";
import React, { useState } from "react";
import { useMobileScreen } from "@/app/utils";
import { AlphaIcon } from "@/app/icons/alpha";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import { LANG_OPTIONS } from "@/app/i18n";
import { Popover } from "antd";
const Links = dynamic(async () => (await import("@/app/lobby/footer")).Links);
const CopyRight = dynamic(
  async () => (await import("@/app/lobby/footer")).CopyRight,
);
export interface HeaderCommonProps {
  pagePath: string;
  hideGGCoin?: boolean;
}

function NavigationBar({ isActive = false }: { isActive?: boolean }) {
  const { t } = useTranslation();
  const isMobileScreen = useMobileScreen();
  return (
    <ul className={styles.navigation}>
      <li>
        <a
          href={isActive ? "#" : "/"}
          target={isActive ? "_self" : "_blank"}
          className={classnames(styles.link, {
            [styles.active]: isActive,
          })}
        >
          {t("Header.Discover")}
        </a>
      </li>
      <li>
        <a
          href={CREATOR_URL}
          className={classnames(styles.link)}
          target="_blank"
        >
          {t("Header.Create")}
        </a>
      </li>
      <li>
        <a href={DEVELOPER} className={classnames(styles.link)} target="_blank">
          {t("Header.Developer")}
        </a>
      </li>
      <li>
        <a href={ABOUT_URL} className={classnames(styles.link)} target="_blank">
          {t("Header.AboutUs")}
        </a>
      </li>
      {isMobileScreen && (
        <li>
          <a
            href={DISCORD_URL}
            className={classnames(styles.link, styles.smaillSize)}
            target="_blank"
          >
            {t("Header.JoinCommunity")}
          </a>
        </li>
      )}
    </ul>
  );
}

function Slogan() {
  const { t } = useTranslation();
  return (
    <div className={classnames(styles.tips, styles.item)}>
      {t("Header.Description")}
      <br />
      {t("Header.Slogan")}
    </div>
  );
}

export function Header(props: HeaderCommonProps) {
  const userStore = useUserStore();
  return (
    <h1 className={classnames(styles.headerWrap, styles.dark)}>
      <div className={styles.header}>
        <div className={classnames(styles.logo, styles.grid)}>
          <a href={RPGGO_URL} target="_blank">
            <LogoIcon className={classnames(styles.item)} />
          </a>
          <div
            className={classnames(styles["dividing-line"], styles.item)}
          ></div>
          <Slogan></Slogan>
        </div>
        <div className={classnames(styles.nav)}>
          <NavigationBar isActive={true} />
        </div>
      </div>
    </h1>
  );
}

export function MobileHeader(props: HeaderCommonProps) {
  const userStore = useUserStore();
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className={styles.mobileHeader}>
      <div className="flex items-center">
        <div className={styles.mobileHeaderNavButton} onClick={togglePopup}>
          <NavButton />
        </div>
        <a href="#">
          <div className={styles.mobileHeaderNavLogo}></div>
        </a>
      </div>

      {isPopupOpen && <HeaderMenu onClose={togglePopup} />}
    </div>
  );
}
function HeaderMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.mobileHeaderNavPage}>
      <div className={styles.mobileHeaderNavLogo}></div>
      <div className={styles.mobileHeaderNavClose} onClick={onClose}>
        <CloseIcon />
      </div>
      <div className={styles.mobileHeaderNavigationBar}>
        <NavigationBar />
      </div>
      <div
        className={classnames(
          footerStyles.mobileHeaderNavigationBar,
          footerStyles["mobile-footer"],
        )}
      >
        <Links />
        <CopyRight />
      </div>
    </div>
  );
}

export function GameHeader(props: Subdomain) {
  const { t } = useTranslation();

  return (
    <header className={classnames(styles.headerWrap, styles.light)}>
      <div className={styles.header}>
        <div className={classnames("window-actions", game["pc-header"])}>
          <a href={RPGGO_URL}>
            <div className={"window-action-button"}>
              <div style={{ display: "flex", alignItems: "flex-start" }}>
                <TextLogoIcon />
                <AlphaIcon className={game["alpha-icon"]} />
              </div>
            </div>
          </a>
          <div className={classnames(game["dividing-line"], game.item)}></div>
          <div className={classnames(game.tips, game.item)}>
            {t("Header.Description")}
            <br />
            {t("Header.Slogan")}
          </div>
        </div>
        <div className={classnames(styles.nav)}>
          <NavigationBar isActive={false} />
        </div>
      </div>
    </header>
  );
}

interface Subdomain extends HeaderCommonProps {
  domain?: string;
  name?: string;
  logo?: string;
  hideGGCoin?: boolean;
  page?: string;
}

export function MobileGameHeader(props: Subdomain) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  return (
    <div className={classnames(game.mobileHeader)}>
      <div className="flex items-center">
        <div className={styles.mobileHeaderNavButton} onClick={togglePopup}>
          <NavButton />
        </div>
        <TextLogoIcon />
        <AlphaIcon className={game["alpha-icon"]} />
      </div>
      {isPopupOpen && <HeaderMenu onClose={togglePopup} />}
    </div>
  );
}

function Lang() {
  const { i18n } = useTranslation();
  const findCurrentLang = () => {
    return LANG_OPTIONS.find((lang) => lang.value === i18n.language);
  };
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const isMobileScreen = useMobileScreen();

  const [visible, setVisible] = useState(false);

  const handleVisibleChange = (newVisible: boolean) => {
    setVisible(newVisible);
  };

  return (
    <Popover
      open={visible}
      onOpenChange={handleVisibleChange}
      content={
        <div className={styles.langItems}>
          {LANG_OPTIONS.map((lang) => (
            <div
              className={classnames(
                styles.item,
                i18n.language === lang.value ? styles.current : "",
                {
                  testmode: ["zh_Hant", "ja"].includes(lang.value),
                },
              )}
              onClick={() => {
                changeLanguage(lang.value);
              }}
              key={lang.value}
            >
              <img src={lang.icon} alt="" />
              {lang.label}
            </div>
          ))}
        </div>
      }
    >
      <div className={styles.lang}>
        <img src={findCurrentLang()?.icon} alt="" />
        <p style={{ fontWeight: isMobileScreen ? 700 : 600 }}>
          {isMobileScreen
            ? findCurrentLang()?.mobileDisplayName
            : findCurrentLang()?.pcDisplayName}
        </p>
        <div
          className={classnames(styles.arrow, {
            [styles["arrow-down"]]: !visible,
          })}
        ></div>
      </div>
    </Popover>
  );
}
