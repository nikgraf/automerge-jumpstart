import { useEffect, useRef } from "react";

type IntervalFunc = () => unknown | void;

// Inspired by https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (callback: IntervalFunc, delay: number | null) => {
  const savedCallback = useRef<IntervalFunc | null>(null);

  useEffect(() => {
    if (delay === null) return;
    savedCallback.current = callback;
  });

  useEffect(() => {
    if (delay === null) return;
    function tick() {
      if (savedCallback.current !== null) {
        savedCallback.current();
      }
    }
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};
