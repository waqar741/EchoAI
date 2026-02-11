import { useEffect } from "react";
import { useChatStore } from "../store/chatStore";

export function useTheme() {
    const theme = useChatStore((s) => s.theme);

    useEffect(() => {
        const root = window.document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const applyTheme = () => {
            root.classList.remove("light", "dark");

            if (theme === "system") {
                root.classList.add(mediaQuery.matches ? "dark" : "light");
            } else {
                root.classList.add(theme);
            }
        };

        applyTheme();

        const listener = () => applyTheme();
        mediaQuery.addEventListener("change", listener);

        return () => mediaQuery.removeEventListener("change", listener);
    }, [theme]);
}
