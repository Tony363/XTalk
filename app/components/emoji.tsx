import EmojiPicker, {
  Emoji,
  EmojiStyle,
  Theme as EmojiTheme,
} from "emoji-picker-react";

import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import classnames from "classnames";

import { getThumbnailUrl } from "@/app/utils";

export function getEmojiUrl(unified: string, style: EmojiStyle) {
  return `https://cdn.staticfile.org/emoji-datasource-apple/14.0.0/img/${style}/64/${unified}.png`;
}

export function AvatarPicker(props: {
  onEmojiClick: (emojiId: string) => void;
}) {
  return (
    <EmojiPicker
      lazyLoadEmojis
      theme={EmojiTheme.AUTO}
      getEmojiUrl={getEmojiUrl}
      onEmojiClick={(e) => {
        props.onEmojiClick(e.unified);
      }}
    />
  );
}

export function Avatar(props: {
  avatar?: string;
  name?: string;
  showOrigin?: boolean;
  className?: string;
}) {
  if (props.avatar) {
    return (
      <div className={classnames(["user-avatar"], props.className ?? "")}>
        <PhotoAvatar
          avatar={props.avatar}
          showOrigin={props?.showOrigin as boolean}
        />
      </div>
    );
  }

  if (props.name) {
    return (
      <div
        className={classnames([
          "user-avatar",
          props.className ?? "",
          "user-avatar-name",
        ])}
      >
        {props.name}
      </div>
    );
  }
}

export function EmojiAvatar(props: { avatar: string; size?: number }) {
  return (
    <Emoji
      unified={props.avatar}
      size={props.size ?? 18}
      getEmojiUrl={getEmojiUrl}
    />
  );
}

export function PhotoAvatar(props: {
  avatar: string;
  size?: number;
  showOrigin: boolean;
}) {
  const { avatar = "", showOrigin = false } = props || {};

  if (!showOrigin) {
    return <img src={getThumbnailUrl(avatar, "60")} alt="avatar" />;
  }

  return (
    <PhotoProvider bannerVisible={false} maskOpacity={0.5} speed={() => 300}>
      <PhotoView src={avatar}>
        <img src={getThumbnailUrl(avatar, "60")} alt="avatar" />
      </PhotoView>
    </PhotoProvider>
  );
}
