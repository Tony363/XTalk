import { isFormal } from "../utils/runtime-env";

export function formatCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDate;
}
export default class Log {
  static info(...params: any[]) {
    if (!isFormal()) console.log(formatCurrentDate(), ...params);
  }

  static warn(...params: any[]) {
    if (!isFormal()) console.log(formatCurrentDate(), ...params);
  }

  static error(...params: any[]) {
    console.error(formatCurrentDate(), ...params);
  }
}
