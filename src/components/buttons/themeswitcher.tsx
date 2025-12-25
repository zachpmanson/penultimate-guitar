import useThemeOnMount from "@/hooks/useThemeOnMount";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useConfigStore } from "src/state/config";
import PlainButton from "../shared/plainbutton";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useThemeOnMount();
  const { debugMode, setDebugMode } = useConfigStore();

  const ModeIcon = theme === "dark" ? SunIcon : MoonIcon;
  return (
    <PlainButton
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      onContextMenu={(e) => setDebugMode(!debugMode)}
      noPadding
      className="flex items-center justify-center w-8 h-8"
    >
      <ModeIcon className="w-4" />
    </PlainButton>
  );
};

export default ThemeSwitcher;
