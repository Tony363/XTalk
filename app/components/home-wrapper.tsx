// @ts-nocheck
"use client";
require("../polyfill");
import { useEffect } from "react";
import styles from "./home.module.scss";
import { useMobileScreen } from "../utils";
import { setDomFontSize } from "../utils/rem";
import { Path } from "../constant";
import { ErrorBoundary } from "./error";
import dynamic from "next/dynamic";

const DarkNavigation = dynamic(
  () => import("@/app/components/navigation").then((mod) => mod.DarkNavigation),
  { ssr: false },
);

const LightNavigation = dynamic(
  () =>
    import("@/app/components/navigation").then((mod) => mod.LightNavigation),
  { ssr: false },
);
import { usePathname } from "next/navigation";
import {
  useChatStore,
  useUserStore,
  USER_DATA_CACHE_KEY,
  PublishState,
} from "../store";
import { User } from "@/app/store/user";
import isEmpty from "lodash/isEmpty";
import Cookies from "js-cookie";
import classNames from "classnames";
import { Loading } from "@/app/components/ui-lib";

type Session = {
  user: User;
};

type HomeProps = {
  session: Session;
  pathname: string;
  children: React.ReactNode;
};

function Screen(props: any) {
  const chatStore = useChatStore();
  const pathname = usePathname();
  const isHome = pathname === Path.Home;
  // fixme later
  const needRemoveBackground = () =>
    !![Path.Chat, Path.Character, Path.Char].every((item) => {
      return !pathname?.startsWith(item);
    });

  if (needRemoveBackground()) {
    if (typeof document !== "undefined") {
      document.body.style.backgroundImage = null;
    }
  }

  const isUnPublish = chatStore.game.publishState === PublishState.unpublished;

  return (
    <div
      className={classNames("layout-wrapper", styles.lobbyContainer, {
        [styles.lobby]: isHome,
      })}
    >
      <div className="layout-header" id="layout-header">
        {[Path.Home, Path.Lobby].includes(pathname) || isUnPublish ? (
          <DarkNavigation pagePath={pathname} />
        ) : (
          <LightNavigation pagePath={pathname} />
        )}
      </div>
      <div
        className={`layout-content ${
          [Path.Home, Path.Lobby].includes(pathname) ? "scroll-bar" : ""
        }`}
        id="layout-content"
      >
        {props.children}
      </div>
    </div>
  );
}

export function HomeWrapper(props: HomeProps) {
  const { session, pathname } = props || {};
  const { user = {} } = session || {};
  const { id: userId } = user || {};

  useEffect(() => {
    setDomFontSize();
  }, []);

  useEffect(() => {
    let user = session?.user;
    let operate = session?.operate || {};
    if (isEmpty(user)) {
      user = {
        name: "RPGGO",
        email: "game@rpggo.ai",
        avatar: "",
        provider: "google",
      };
      operate = { new_user: false };

      localStorage.setItem(USER_DATA_CACHE_KEY, JSON.stringify(user));
    }
    useUserStore.getState().login({ user, operate });
    const country = Cookies.get("country_cookies");
    useUserStore.getState().setCountry(country || "default");
  }, []);
  return (
    <ErrorBoundary>
      <Screen>{props.children}</Screen>
    </ErrorBoundary>
  );
}

export function HomeLoader() {
  const isMobileScreen = useMobileScreen();
  if (isMobileScreen) return <HomeMobileLoader></HomeMobileLoader>;
  return (
    <div className={styles.HomeLoader}>
      <Loading />
    </div>
  );
}

export function HomeMobileLoader({
  showTitle = true,
}: {
  showTitle?: boolean;
}) {
  return (
    <div className={styles.HomeMobileLoader}>
      {showTitle && <div className={styles.loaderTitle}></div>}
      <div className={styles.loaderWrap}>
        {Array.from({ length: 6 }, (_, index) => index).map((item) => {
          return (
            <div className={styles.loaderItem} key={item}>
              <div className={styles.rect1}></div>
              <div className={styles.rect2}></div>
              <div className={styles.rect3}></div>
              <div className={styles.loaderUser}>
                <div className={styles.circular}></div>
                <div className={styles.rect4}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
