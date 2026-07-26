import { RefObject, useEffect, useRef, useState } from "react";

const SCROLL_MS = 100;

export default function useAutoscroll(element: RefObject<HTMLElement>) {
  const scrollinterval = useRef<NodeJS.Timer>();
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const isTouching = useRef(false);

  function changeScrolling(type: "up" | "down") {
    clearInterval(scrollinterval.current);
    if (type === "up") {
      if (scrollSpeed === 0) {
        setScrollSpeed(0.5);
      } else if (scrollSpeed === 0.5) {
        setScrollSpeed(1);
      } else {
        setScrollSpeed(scrollSpeed + 1);
      }
    } else {
      if (scrollSpeed === 1) {
        setScrollSpeed(0.5);
      } else if (scrollSpeed === 0.5) {
        setScrollSpeed(0);
      } else if (scrollSpeed > 0) {
        setScrollSpeed(scrollSpeed - 1);
      }
    }
    if (element?.current?.focus) element.current.focus();
  }

  useEffect(() => {
    if (scrollSpeed > 0) {
      const interval = scrollSpeed < 1 ? SCROLL_MS * 2 : SCROLL_MS;
      const pixels = scrollSpeed < 1 ? 1 : scrollSpeed;
      scrollinterval.current = setInterval(() => {
        if (!isTouching.current) {
          window.scrollBy({
            top: pixels,
            left: 0,
            behavior: "smooth",
          });
        }
        if (element.current)
          console.log(`(${window.innerHeight + window.scrollY}) >= ${document.body.scrollHeight - 5}`);
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 5) {
          setScrollSpeed(0);
          clearInterval(scrollinterval.current);
        }
      }, interval);
    }
    return () => {
      clearInterval(scrollinterval.current);
    };
  }, [scrollSpeed, element]);

  return {
    scrollSpeed,
    changeScrolling,
    setScrollSpeed,
    isTouching,
  };
}
