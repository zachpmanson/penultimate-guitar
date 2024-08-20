import React from "react";
import { useTheme } from "next-themes";

import PlainButton from "../shared/plainbutton";
import IconDarkMode from "../icons/IconDarkMode";
import IconLightMode from "../icons/IconLightMode";
import LoadingSpinner from "../loadingspinner";

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
        onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
        className="pl-2 pr-2"
      >
        <LoadingSpinner className="w-4 h-4" />
      </PlainButton>
    );
  }

  const DarkLightIcon = theme == "dark" ? IconDarkMode : IconLightMode;
  return (
    <PlainButton
      onClick={() => setTheme(theme == "dark" ? "light" : "dark")}
      className="pl-2 pr-2"
    >
      <DarkLightIcon
        className="w-4 h-4"
        color={theme == "dark" ? "white" : "black"}
      />
    </PlainButton>
  );
};

export default ThemeSwitcher;
