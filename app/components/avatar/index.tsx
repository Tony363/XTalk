// 解决多种头像尺寸问题 替换掉lobby中的author
import styles from "./index.module.scss";
import classnames from "classnames";
import { getAcronym } from "@/app/utils/format";
import { getThumbnailUrl } from "@/app/utils";

type Props = {
  nickname: string;
  avatar: string;
  className?: string;
  size?: "PC24_M40" | "PC32_M32" | "PC32_M47";
};

export function Avatar(props: Props) {
  const { nickname, avatar, className = "", size = "PC24_M40" } = props;

  return (
    <div className={classnames(styles.avatar, styles[size], className)}>
      {avatar ? (
        <img src={getThumbnailUrl(avatar, "60")} />
      ) : (
        getAcronym(nickname, 1) || "R"
      )}
    </div>
  );
}
