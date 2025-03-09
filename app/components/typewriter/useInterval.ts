// @ts-nocheck
import React from "react";

const useInterval = (
  callback: () => void,
  delay: number | null,
): React.MutableRefObject<number | null> => {
  const intervalRef = React.useRef<number | null>(null);
  const savedCallback = React.useRef<() => void>(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = window.setInterval(tick, delay);
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);

  return intervalRef;
};

export default useInterval;
