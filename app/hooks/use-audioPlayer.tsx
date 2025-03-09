import { useEffect, useState } from "react";

export const useAudioPlayer = (url: string, isLoop = false) => {
  const [audio, setAudio] = useState(new Audio(url));
  audio.loop = isLoop;
  const [isPlaying, setIsPlaying] = useState(false);

  const play = () => {
    audio.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audio.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, [audio]);

  // Need to switch sound sources
  useEffect(() => {
    if (!url) return;
    if (!audio.src) return;
    if (audio.src !== url) {
      const wasPlaying = isPlaying;
      audio.pause();
      const newAudio = new Audio(url);
      audio.loop = isLoop;

      setAudio(newAudio);
      if (wasPlaying) {
        newAudio.play();
        setIsPlaying(true);
      }
    }
  }, [audio.src, url, isPlaying, isLoop]);

  return { play, pause, isPlaying };
};
