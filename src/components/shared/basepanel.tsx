import { ReactNode, useRef, useState } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Load } from "../loadingspinner";

export default function BasePanel({
  isOpen,
  setIsOpen,
  header,
  children,
  footer,
  id,
  isLoading,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  id: string;
  isLoading?: boolean;
}) {
  const [hovering, setHovering] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div className="" ref={divRef}></div>
      <div
        className={
          "bg-gray-200 dark:bg-gray-800 dark:border-gray-600 rounded-xl border transition-transform duration-75 max-h-fit " +
          (hovering ? " hover:border-gray-400 dark:hover:border-gray-700" : "")
        }
        id={id}
        onMouseOver={() => setHovering(true)}
        onMouseOut={() => setHovering(false)}
      >
        <div
          className="flex gap-2 justify-between p-2 px-3 items-center z-10 sticky top-0 bg-gray-200 dark:bg-gray-800 rounded-xl"
          onClick={() => {
            if (isOpen && divRef.current && window.scrollY > divRef.current.offsetTop) {
              divRef.current.scrollIntoView({ behavior: "smooth" });
            }
            setIsOpen(!isOpen);
          }}
        >
          {header}
          <ChevronLeftIcon className={"w-4 h-4 transition " + (isOpen ? "-rotate-90" : "")} />
        </div>
        {isOpen && (
          <div className={"flex flex-col gap-1 p-2 pt-0 mt-0 "} style={{ transition: "max-height 1s ease-in-out" }}>
            <Load isLoading={!!isLoading}>{children}</Load>
            <div className={"flex justify-between items-middle "}>{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
}
