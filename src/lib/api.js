const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";
const AUTH_TOKEN_KEY = "fittrack_token";

export async function apiRequest(path, { token, ...options } = {}) {
    const savedToken = token ?? window.localStorage.getItem(AUTH_TOKEN_KEY);
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(savedToken ? { Authorization: `Bearer ${savedToken}` } : {}),
            ...options.headers,
        },
    });

    const result = response.status === 204 ? {} : await response.json();
    if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
        clearAuthToken();
        window.dispatchEvent(new Event("fittrack:unauthorized"));
    }
    if (!response.ok) {
        throw new Error(result.error ?? "The request could not be completed.");
    }
    return result;
}

export function saveAuthToken(token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
}
