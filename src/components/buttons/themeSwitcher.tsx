import React from "react";
import { useTheme } from "next-themes";

import PlainButton from "../shared/plainbutton";
import LoadingSpinner from "../loadingspinner";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // Using useEffect to not run into layout issues
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // If we haven't mounted yet, return a placeholder icon
    return (
      <PlainButton
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="pl-2 pr-2"
      >
        <LoadingSpinner className="w-4 h-4" />
      </PlainButton>
    );
  }

  const ModeIcon = theme === "dark" ? SunIcon : MoonIcon;
  return (
    <PlainButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="pl-2 pr-2"
    >
      <ModeIcon className="w-4" />
    </PlainButton>
  );
};

export default ThemeSwitcher;
