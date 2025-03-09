import { useEffect, useState } from "react";
import { showToast } from "./components/ui-lib";
import Locale from "./locales";

export function trimTopic(topic: string) {
  return topic.replace(/[，。！？”“"、,.!?]*$/, "");
}

export async function copyToClipboard(text: string, toast = "") {
  try {
    if (window.__TAURI__) {
      window.__TAURI__.writeText(text);
    } else {
      await navigator.clipboard.writeText(text);
    }

    showToast(toast || Locale.Copy.Success);
  } catch (error) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(Locale.Copy.Success);
    } catch (error) {
      showToast(Locale.Copy.Failed);
    }
    document.body.removeChild(textArea);
  }
}

export async function downloadAs(text: string, filename: string) {
  if (window.__TAURI__) {
    const result = await window.__TAURI__.dialog.save({
      defaultPath: `${filename}`,
      filters: [
        {
          name: `${filename.split(".").pop()} files`,
          extensions: [`${filename.split(".").pop()}`],
        },
        {
          name: "All Files",
          extensions: ["*"],
        },
      ],
    });

    if (result !== null) {
      try {
        await window.__TAURI__.fs.writeBinaryFile(
          result,
          new Uint8Array([...text].map((c) => c.charCodeAt(0))),
        );
        showToast(Locale.Download.Success);
      } catch (error) {
        showToast(Locale.Download.Failed);
      }
    } else {
      showToast(Locale.Download.Failed);
    }
  } else {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text),
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
}
export function readFromFile() {
  return new Promise<string>((res, rej) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "application/json";

    fileInput.onchange = (event: any) => {
      const file = event.target.files[0];
      const fileReader = new FileReader();
      fileReader.onload = (e: any) => {
        res(e.target.result);
      };
      fileReader.onerror = (e) => rej(e);
      fileReader.readAsText(file);
    };

    fileInput.click();
  });
}

export function isIOS() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
}

export function useWindowSize() {
  let initialWidth, initialHeight;
  try {
    initialWidth = window.innerWidth;
    initialHeight = window.innerHeight;
  } catch (error) {}

  const [size, setSize] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  useEffect(() => {
    const onResize = () => {
      setSize({
        width: window?.innerWidth,
        height: window?.innerHeight,
      });
    };

    window?.addEventListener("resize", onResize);

    return () => {
      window?.removeEventListener("resize", onResize);
    };
  }, []);

  return size;
}

export const MOBILE_MAX_WIDTH = 600;
export function useMobileScreen() {
  const { width } = useWindowSize();

  return width <= MOBILE_MAX_WIDTH;
}

export function isFirefox() {
  return (
    typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)
  );
}

export function selectOrCopy(el: HTMLElement, content: string) {
  const currentSelection = window.getSelection();

  if (currentSelection?.type === "Range") {
    return false;
  }

  copyToClipboard(content);

  return true;
}

function getDomContentWidth(dom: HTMLElement) {
  const style = window.getComputedStyle(dom);
  const paddingWidth =
    parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
  const width = dom.clientWidth - paddingWidth;
  return width;
}

function getOrCreateMeasureDom(id: string, init?: (dom: HTMLElement) => void) {
  let dom = document.getElementById(id);

  if (!dom) {
    dom = document.createElement("span");
    dom.style.position = "absolute";
    dom.style.wordBreak = "break-word";
    dom.style.fontSize = "14px";
    dom.style.transform = "translateY(-200vh)";
    dom.style.pointerEvents = "none";
    dom.style.opacity = "0";
    dom.id = id;
    document.body.appendChild(dom);
    init?.(dom);
  }

  return dom!;
}

export function autoGrowTextArea(dom: HTMLTextAreaElement) {
  const measureDom = getOrCreateMeasureDom("__measure");
  const singleLineDom = getOrCreateMeasureDom("__single_measure", (dom) => {
    dom.innerText = "TEXT_FOR_MEASURE";
  });

  const width = getDomContentWidth(dom);
  measureDom.style.width = width + "px";
  measureDom.innerText = dom.value !== "" ? dom.value : "1";
  measureDom.style.fontSize = dom.style.fontSize;
  const endWithEmptyLine = dom.value.endsWith("\n");
  const height = parseFloat(window.getComputedStyle(measureDom).height);
  const singleLineHeight = parseFloat(
    window.getComputedStyle(singleLineDom).height,
  );

  const rows =
    Math.round(height / singleLineHeight) + (endWithEmptyLine ? 1 : 0);

  return rows;
}

export function getCSSVar(varName: string) {
  return getComputedStyle(document.body).getPropertyValue(varName).trim();
}

/**
 * Detects Macintosh
 */
export function isMacOS(): boolean {
  if (typeof window !== "undefined") {
    let userAgent = window.navigator.userAgent.toLocaleLowerCase();
    const macintosh = /iphone|ipad|ipod|macintosh/.test(userAgent);
    return !!macintosh;
  }
  return false;
}

// check if the url is a rpggo-game url
export function isRpggoGameUrl(url: string) {
  return url?.includes("/rpggo-game/rpggo-creator/");
}

// replace the rpggo-game url with the original url
// https://storage.googleapis.com/rpggo-game/rpggo-creator/022a0306-2f75-496f-9959-18d1d7c3b61a/1dcc778b-c156-4e09-ad93-edd61a13f0fb
// get the pathname of the url 'https://storage.cloud.google.com/rpggo-assets/rpggo-creator/780bd12d-dac7-4b1c-80e7-4d61736d0389/e6efedb3-3d6f-4989-aee6-93e49db76ddf_thumbnail_360x360_v1'
function getPathname(url: string) {
  return new URL(url).pathname;
}

export function replaceDir(url: string) {
  return url.replace("/rpggo-game", "");
}

const CDN_HOST = "https://cdn.rpggo.ai";

export function getThumbnailUrl(
  originalUrl: string,
  size: string,
  version = "v1",
) {
  if (!isRpggoGameUrl(originalUrl)) {
    return originalUrl;
  }
  const originalName = getPathname(replaceDir(originalUrl));

  const supportedExtensions = ["png", "jpeg", "jpg", "webp"];

  const lastDotIndex = originalName.lastIndexOf(".");

  const suffix = `_thumbnail_${size}x${size}_${version}`;

  if (lastDotIndex === -1) {
    return `${CDN_HOST}${originalName}${suffix}`;
  }

  const fileName = originalName.substring(0, lastDotIndex);
  const fileExtension = originalName.substring(lastDotIndex + 1).toLowerCase();

  if (!supportedExtensions.includes(fileExtension)) {
    console.error(`[Thumbnail] Unsupported file extension: ${fileExtension}`);
    return originalName;
  }

  return `${CDN_HOST}${fileName}${suffix}.${fileExtension}`;
}
