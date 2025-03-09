import Typewriter from "@/app/components/typewriter";
import ReactMarkdown from "react-markdown";
import "katex/dist/katex.min.css";
import RemarkMath from "remark-math";
import RemarkBreaks from "remark-breaks";
import RemarkGfm from "remark-gfm";
import RehypeHighlight from "rehype-highlight";
import { useRef, useState, RefObject, useEffect, useMemo } from "react";
import { copyToClipboard } from "../utils";
import mermaid from "mermaid";

import LoadingIcon from "../icons/three-dots.svg";
import React from "react";
import { useDebouncedCallback } from "use-debounce";
import { showImageModal } from "./ui-lib";
import { SYSTEM_MESSAGE_TYPE } from "@/app/store";

export function Mermaid(props: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (props.code && ref.current) {
      mermaid
        .run({
          nodes: [ref.current],
          suppressErrors: true,
        })
        .catch((e) => {
          setHasError(true);
          console.error("[Mermaid] ", e.message);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.code]);

  function viewSvgInNewWindow() {
    const svg = ref.current?.querySelector("svg");
    if (!svg) return;
    const text = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([text], { type: "image/svg+xml" });
    showImageModal(URL.createObjectURL(blob));
  }

  if (hasError) {
    return null;
  }

  return (
    <div
      className="no-dark mermaid"
      style={{
        cursor: "pointer",
        overflow: "auto",
      }}
      ref={ref}
      onClick={() => viewSvgInNewWindow()}
    >
      {props.code}
    </div>
  );
}

export function PreCode(props: { children: any }) {
  const ref = useRef<HTMLPreElement>(null);
  const refText = ref.current?.innerText;
  const [mermaidCode, setMermaidCode] = useState("");

  const renderMermaid = useDebouncedCallback(() => {
    if (!ref.current) return;
    const mermaidDom = ref.current.querySelector("code.language-mermaid");
    if (mermaidDom) {
      setMermaidCode((mermaidDom as HTMLElement).innerText);
    }
  }, 600);

  useEffect(() => {
    setTimeout(renderMermaid, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refText]);

  return (
    <>
      {mermaidCode.length > 0 && (
        <Mermaid code={mermaidCode} key={mermaidCode} />
      )}
      <pre ref={ref}>
        <span
          className="copy-code-button"
          onClick={() => {
            if (ref.current) {
              const code = ref.current.innerText;
              copyToClipboard(code);
            }
          }}
        ></span>
        {props.children}
      </pre>
    </>
  );
}

function escapeDollarNumber(text: string) {
  return text;
  let escapedText = "";

  for (let i = 0; i < text.length; i += 1) {
    let char = text[i];
    const nextChar = text[i + 1] || " ";

    if (char === "$" && nextChar >= "0" && nextChar <= "9") {
      char = "\\$";
    }

    escapedText += char;
  }

  return escapedText;
}

function MarkDownContentComp(props: {
  systemMessageType?: string;
  content: string;
  messageState?: {
    isRead: boolean;
    messageId: string;
    isGetNextMessage: boolean;
  };
  updateCurrentMessage?: (messageId: string) => void;
}) {
  const escapedContent = useMemo(
    () => escapeDollarNumber(props.content),
    [props.content],
  );

  const onFinish = () => {
    if (props.systemMessageType !== SYSTEM_MESSAGE_TYPE.picture) {
      if (props.messageState?.messageId) {
        props.updateCurrentMessage?.(props.messageState?.messageId);
      }
    }
    if (props.messageState?.isGetNextMessage) {
      const event = new CustomEvent("typewriterEnd");
      const timer = setTimeout(() => {
        window.dispatchEvent(event);
      }, 500);
      return () => clearTimeout(timer);
    }
  };
  const isOpenTyping = !props?.messageState?.isRead;

  return (
    <Typewriter isTypingActive={isOpenTyping} delay={30} onFinish={onFinish}>
      <ReactMarkdown
        remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
        rehypePlugins={[
          // RehypeKatex,
          [
            RehypeHighlight,
            {
              detect: false,
              ignoreMissing: true,
            },
          ],
        ]}
        components={{
          pre: PreCode,
          p: (pProps) => <p {...pProps} dir="auto" />,
          a: (aProps) => {
            const href = aProps.href || "";
            const isInternal = /^\/#/i.test(href);
            const target = isInternal ? "_self" : (aProps.target ?? "_blank");
            return <a {...aProps} target={target} />;
          },
        }}
      >
        {escapedContent}
      </ReactMarkdown>
    </Typewriter>
  );
}

export const MarkdownContent = React.memo(MarkDownContentComp);

export function Markdown(
  props: {
    systemMessageType?: string;
    content: string;
    loading?: boolean;
    fontSize?: number;
    parentRef?: RefObject<HTMLDivElement>;
    defaultShow?: boolean;
    messageState?: {
      isRead: boolean;
      messageId: string;
      isGetNextMessage: boolean;
    };
    updateCurrentMessage?: (messageId: string) => void;
  } & React.DOMAttributes<HTMLDivElement>,
) {
  const mdRef = useRef<HTMLDivElement>(null);
  return (
    <div
      className="markdown-body"
      style={{
        fontSize: `${props.fontSize ?? 14}px`,
      }}
      ref={mdRef}
      onContextMenu={props.onContextMenu}
      onDoubleClickCapture={props.onDoubleClickCapture}
      dir="auto"
    >
      {props.loading ? (
        <LoadingIcon />
      ) : (
        <MarkdownContent
          systemMessageType={props.systemMessageType}
          content={props.content}
          messageState={props.messageState}
          updateCurrentMessage={props.updateCurrentMessage}
        />
      )}
    </div>
  );
}
