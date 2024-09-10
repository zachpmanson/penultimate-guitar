import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function useThemeOnMount() {
  const t = useTheme();
  const [mounted, setMounted] = useState(false);

  // Using useEffect to not run into layout issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return { ...t, theme: mounted ? t.theme : "light" };
}
