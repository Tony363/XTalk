"use client";
import styles from "./login.module.scss";
import { useEffect } from "react";
import { useUserStore } from "@/app/store/user";
import { AUTH_URL } from "@/app/constant";
import classNames from "classnames";
import { showToast } from "../ui-lib";

interface ConfirmProps {
  confirmCallback?: Function;
  onClose?: any;
}

export function Login({ onClose }: ConfirmProps) {
  const userStore = useUserStore();

  useEffect(() => {
    const receiveMessage = (event: any) => {
      const messageData = event.data;
      if (messageData.event === "USER_LOGIN") {
        userStore.login(messageData.data);
        onClose();
        showToast("Login successful!");
      }
    };

    window.addEventListener("message", receiveMessage, false);
  }, []);

  const signIn = (channel?: string) => {
    const LOGIN_URL = AUTH_URL;
    const url = `${LOGIN_URL}diago?channel=${channel}`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 3;
    window.open(
      url,
      "Login",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  };
  return (
    <div className={styles.mask}>
      <div className={styles.login}>
        <div className={styles.close} onClick={onClose}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4L20 20"
              stroke="#1F1F1F"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M4 20L20 4"
              stroke="#1F1F1F"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <img
          className={styles.logo}
          src="https://storage.googleapis.com/rpggo_images/creator-tool/logo.svg"
          alt=""
        />
        <div className={styles.limited}>LOGIN TO CONTINUE</div>
        <div className={styles.btns}>
          <div
            className={styles.btn}
            onClick={() => {
              signIn("google");
            }}
          >
            <p className={classNames(styles.icon, styles["icon-google"])}></p>
            <p>Login with Google</p>
          </div>
          <div
            className={styles.btn}
            onClick={() => {
              signIn("discord");
            }}
          >
            <p className={classNames(styles.icon, styles["icon-discord"])}></p>
            <p>Login with Discord</p>
          </div>
          {userStore.country === "china" && (
            <div
              className={styles.btn}
              onClick={() => {
                signIn("authing");
              }}
            >
              <p className={classNames(styles.icon, styles["icon-phone"])}></p>
              <p>Login with Phone</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
