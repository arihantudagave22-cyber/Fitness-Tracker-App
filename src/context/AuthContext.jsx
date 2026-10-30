import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext.js";
import { apiRequest, clearAuthToken } from "../lib/api.js";

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(() =>
        Boolean(window.localStorage.getItem("fittrack_token"))
    );

    useEffect(() => {
        let isCurrent = true;
        const handleUnauthorized = () => {
            if (isCurrent) {
                setUser(null);
            }
        };
        window.addEventListener("fittrack:unauthorized", handleUnauthorized);

        const token = window.localStorage.getItem("fittrack_token");
        if (token) {
            apiRequest("/auth/me", { token })
                .then((result) => {
                    if (isCurrent) {
                        setUser(result.user);
                    }
                })
                .catch(() => {
                    clearAuthToken();
                    if (isCurrent) {
                        setUser(null);
                    }
                })
                .finally(() => {
                    if (isCurrent) {
                        setIsLoading(false);
                    }
                });
        }

        return () => {
            isCurrent = false;
            window.removeEventListener("fittrack:unauthorized", handleUnauthorized);
        };
    }, []);

    const signIn = useCallback((nextUser) => setUser(nextUser), []);
    const signOut = useCallback(() => {
        clearAuthToken();
        setUser(null);
    }, []);
    const value = useMemo(
        () => ({ user, isLoading, signIn, signOut }),
        [user, isLoading, signIn, signOut],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
