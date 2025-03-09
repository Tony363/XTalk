import { useMobileScreen } from "@/app/utils";
import {
  Header,
  MobileHeader,
  type HeaderCommonProps,
} from "@/app/lobby/header";
export function DarkNavigation(props: HeaderCommonProps) {
  const isMobileScreen = useMobileScreen();
  return isMobileScreen ? (
    <MobileHeader pagePath={props.pagePath} hideGGCoin={props.hideGGCoin} />
  ) : (
    <Header pagePath={props.pagePath} hideGGCoin={props.hideGGCoin} />
  );
}
