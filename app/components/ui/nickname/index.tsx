import styles from "./nickname.module.scss";
import classnames from "classnames";

type Props = {
  name: string;
  className: string;
};

export function Nickname(props: Props) {
  const { name = "", className } = props;
  if (!name) return null;
  return (
    <div className={classnames(styles["nickname"], className)}>{name}</div>
  );
}
