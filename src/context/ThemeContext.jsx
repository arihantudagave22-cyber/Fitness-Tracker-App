import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext.js";

const THEME_STORAGE_KEY = "fittrack_theme";

function getInitialTheme() {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === "light" ? "light" : "dark";
}

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        toggleTheme: () => setTheme((currentTheme) => (
            currentTheme === "dark" ? "light" : "dark"
        )),
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export default ThemeProvider;
