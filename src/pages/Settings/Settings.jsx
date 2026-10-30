import {
    Bell,
    ChevronRight,
    Globe,
    KeyRound,
    Lock,
    Moon,
    Sun,
    ShieldCheck,
    Smartphone,
    UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { useTheme } from "../../context/ThemeContext.js";
import { apiRequest } from "../../lib/api.js";
import "./Settings.css";

const preferenceRows = [
    {
        key: "notifications",
        title: "Notifications",
        description: "Save your notification preference for this account.",
        icon: Bell,
        iconClass: "settings-row__icon--blue",
    },
    {
        key: "workoutReminders",
        title: "Workout reminders",
        description: "Save whether you want workout reminders enabled.",
        icon: Smartphone,
        iconClass: "settings-row__icon--orange",
    },
    {
        key: "privateProfile",
        title: "Private profile",
        description: "Keep your profile private by default.",
        icon: UserRound,
        iconClass: "settings-row__icon--green",
    },
];

const Settings = () => {
    const [preferences, setPreferences] = useState(null);
    const [pendingPreference, setPendingPreference] = useState("");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { theme, toggleTheme } = useTheme();
    const darkMode = theme === "dark";

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/settings")
            .then((result) => {
                if (isCurrent) setPreferences(result.settings);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            });
        return () => { isCurrent = false; };
    }, []);

    const updatePreference = async (key) => {
        if (!preferences || pendingPreference) return;
        setError("");
        setMessage("");
        setPendingPreference(key);
        try {
            const result = await apiRequest("/settings", {
                method: "PATCH",
                body: JSON.stringify({ [key]: !preferences[key] }),
            });
            setPreferences(result.settings);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setPendingPreference("");
        }
    };

    const changePassword = async (event) => {
        event.preventDefault();
        setError("");
        setMessage("");
        try {
            const result = await apiRequest("/auth/change-password", {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            setMessage(result.message);
            setCurrentPassword("");
            setNewPassword("");
            setShowPasswordForm(false);
        } catch (requestError) {
            setError(requestError.message);
        }
    };

    return (
        <section className="settings-page">
            <header className="settings-header">
                <div>
                    <span className="settings-eyebrow">SETTINGS</span>
                    <h1>Customize your experience.</h1>
                    <p>Manage your preferences and account security.</p>
                </div>
                <FitnessVisual3D icon={ShieldCheck} variant="violet" />
            </header>

            {error && <p className="app-error" role="alert">{error}</p>}
            {message && <p className="app-success" role="status">{message}</p>}

            <section className="settings-section">
                <div className="settings-section__heading">
                    <div><span>PREFERENCES</span><h2>App experience</h2></div>
                    <Moon size={20} />
                </div>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-row__icon">{darkMode ? <Moon size={19} /> : <Sun size={19} />}</div>
                        <div className="settings-row__content">
                            <strong>Dark mode</strong>
                            <span>{darkMode ? "Dark appearance is enabled." : "Light appearance is enabled."}</span>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${darkMode ? "settings-toggle--active" : ""}`}
                            onClick={toggleTheme}
                            aria-label={`Turn ${darkMode ? "off" : "on"} dark mode`}
                            aria-pressed={darkMode}
                        ><span /></button>
                    </div>
                    <div className="settings-divider" />
                    <div className="settings-row">
                        <div className="settings-row__icon"><Globe size={19} /></div>
                        <div className="settings-row__content">
                            <strong>Language</strong><span>English</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <div className="settings-section__heading">
                    <div><span>NOTIFICATIONS</span><h2>Account preferences</h2></div>
                    <Bell size={20} />
                </div>
                <div className="settings-card">
                    {preferenceRows.slice(0, 2).map((preference, index) => {
                        const Icon = preference.icon;
                        return (
                            <div key={preference.key}>
                                {index > 0 && <div className="settings-divider" />}
                                <div className="settings-row">
                                    <div className={`settings-row__icon ${preference.iconClass}`}><Icon size={19} /></div>
                                    <div className="settings-row__content">
                                        <strong>{preference.title}</strong><span>{preference.description}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className={`settings-toggle ${preferences?.[preference.key] ? "settings-toggle--active" : ""}`}
                                        onClick={() => updatePreference(preference.key)}
                                        disabled={!preferences || Boolean(pendingPreference)}
                                        aria-label={`Toggle ${preference.title}`}
                                        aria-pressed={Boolean(preferences?.[preference.key])}
                                    ><span /></button>
                                </div>
                            </div>
                        );
                    })}
                    {!preferences && !error && <p className="settings-loading" role="status">Loading preferences...</p>}
                </div>
            </section>

            <section className="settings-section">
                <div className="settings-section__heading">
                    <div><span>PRIVACY</span><h2>Control your visibility</h2></div>
                    <Lock size={20} />
                </div>
                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-row__icon settings-row__icon--green"><UserRound size={19} /></div>
                        <div className="settings-row__content">
                            <strong>Private profile</strong>
                            <span>{preferenceRows[2].description}</span>
                        </div>
                        <button
                            type="button"
                            className={`settings-toggle ${preferences?.privateProfile ? "settings-toggle--active" : ""}`}
                            onClick={() => updatePreference("privateProfile")}
                            disabled={!preferences || Boolean(pendingPreference)}
                            aria-label="Toggle private profile"
                            aria-pressed={Boolean(preferences?.privateProfile)}
                        ><span /></button>
                    </div>
                </div>
            </section>

            <section className="settings-section">
                <div className="settings-section__heading">
                    <div><span>SECURITY</span><h2>Account security</h2></div>
                    <KeyRound size={20} />
                </div>
                <div className="settings-card">
                    <button
                        type="button"
                        className="settings-action"
                        onClick={() => setShowPasswordForm((show) => !show)}
                        aria-expanded={showPasswordForm}
                    >
                        <div className="settings-row__icon"><KeyRound size={19} /></div>
                        <div className="settings-row__content">
                            <strong>Change password</strong><span>Update your account password.</span>
                        </div>
                        <ChevronRight size={18} />
                    </button>
                    {showPasswordForm && (
                        <form className="settings-password-form" onSubmit={changePassword}>
                            <label htmlFor="current-password">Current password</label>
                            <input
                                id="current-password"
                                type="password"
                                autoComplete="current-password"
                                value={currentPassword}
                                onChange={(event) => setCurrentPassword(event.target.value)}
                                required
                            />
                            <label htmlFor="new-password">New password</label>
                            <input
                                id="new-password"
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                maxLength={128}
                                value={newPassword}
                                onChange={(event) => setNewPassword(event.target.value)}
                                required
                            />
                            <button type="submit">Update password</button>
                        </form>
                    )}
                </div>
            </section>
        </section>
    );
};

export default Settings;
