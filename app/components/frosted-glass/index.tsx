import style from "./index.module.scss";
import classNames from "classnames";
export function FrostedGlass({
  url,
  classname,
  backgroundColor = "rgba(0, 0, 0, .6)",
  isWrapperHasBg = false,
}: {
  url: string;
  classname: string;
  backgroundColor: string;
  isWrapperHasBg?: boolean;
}) {
  return (
    <div
      className={classNames(style.FrostedGlass, classname)}
      style={{ backgroundImage: `url("${isWrapperHasBg ? url : ""}")` }}
    >
      <div
        className={style.backgroundImage}
        style={{ backgroundImage: `url("${url}")` }}
      ></div>
      <div
        className={style.backgroundColor}
        style={{ backgroundColor: backgroundColor }}
      />
    </div>
  );
}
