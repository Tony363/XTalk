import styles from "./index.module.scss";
import RedditIcon from "../../icons/Reddit.svg";
import TwitterIcon from "../../icons/Twitter.svg";
import DiscordIcon from "../../icons/Discord-icon.svg";
import MediumIcon from "../../icons/Medium.svg";
import {
  POLICY,
  MEDIUM_URL,
  DISCORD_URL,
  TWITTER_URL,
  REDDIT_URL,
} from "@/app/constant";

import { useMobileScreen } from "../../utils";
import classnames from "classnames";
import { useTranslation } from "react-i18next";

export function CopyRight() {
  const { t } = useTranslation();
  const thisYear = new Date().getFullYear();
  return (
    <div className={styles.copyright}>
      ©{thisYear} {t("Footer.Copyright")}
    </div>
  );
}

function Icons() {
  return (
    <div className={styles.icons}>
      <a href={REDDIT_URL} target="_blank">
        <RedditIcon className={styles.icon} />
      </a>
      <a href={TWITTER_URL} target="_blank">
        <TwitterIcon className={styles.icon} />
      </a>
      <a href={DISCORD_URL} target="_blank">
        <DiscordIcon className={styles.icon} />
      </a>
      <a href={MEDIUM_URL} target="_blank">
        <MediumIcon className={styles.icon} />
      </a>
    </div>
  );
}

export function Links() {
  const { t } = useTranslation();
  return (
    <div className={styles.links}>
      <a href={POLICY.service} target="_blank">
        {t("Footer.TermsOfService")}
      </a>
      <a href={POLICY.privacy} target="_blank">
        {t("Footer.PrivacyPolicy")}
      </a>
      <a href={POLICY.cookie} target="_blank">
        {t("Footer.CookiePolicy")}
      </a>
    </div>
  );
}
export function Footer() {
  const isMobileScreen = useMobileScreen();
  return isMobileScreen ? (
    <div className={classnames(styles.footer, styles["mobile-footer"])}>
      <Icons />
      <Links />
      <CopyRight />
    </div>
  ) : (
    <div className={styles.footer}>
      <CopyRight />
      <Icons />
      <Links />
    </div>
  );
}
