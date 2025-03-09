"use client";
import {
  GameHeader,
  MobileGameHeader,
  type HeaderCommonProps,
} from "@/app/lobby/header";
import { useMobileScreen } from "@/app/utils";

export function LightNavigation(props: HeaderCommonProps) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isMobileScreen = useMobileScreen();
  return isMobileScreen ? (
    <MobileGameHeader pagePath={props.pagePath} />
  ) : (
    <GameHeader pagePath={props.pagePath} />
  );
}
