import { RefObject, useEffect, useRef, useState } from "react";

const SCROLL_MS = 100;

export default function useAutoscroll(element: RefObject<HTMLElement>) {
  const scrollinterval = useRef<NodeJS.Timer>();
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const isTouching = useRef(false);

  function changeScrolling(type: "up" | "down") {
    clearInterval(scrollinterval.current);
    if (type === "up") {
      setScrollSpeed(scrollSpeed + 1);
    } else {
      if (scrollSpeed > 0) {
        setScrollSpeed(scrollSpeed - 1);
      }
    }
    if (element?.current?.focus) element.current.focus();
  }

  useEffect(() => {
    if (scrollSpeed > 0) {
      scrollinterval.current = setInterval(() => {
        if (!isTouching.current) {
          window.scrollBy({
            top: scrollSpeed,
            left: 0,
            behavior: "smooth",
          });
        }
        if (element.current)
          console.log(
            `(${window.innerHeight + window.scrollY}) >= ${
              document.body.scrollHeight - 5
            }`
          );
        if (
          window.innerHeight + window.scrollY >=
          document.body.scrollHeight - 5
        ) {
          setScrollSpeed(0);
          clearInterval(scrollinterval.current);
        }
      }, SCROLL_MS);
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
