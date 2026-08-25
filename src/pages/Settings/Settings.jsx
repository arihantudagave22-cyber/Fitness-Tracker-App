import {
    Bell,
    ChevronRight,
    Globe,
    KeyRound,
    Lock,
    Moon,
    ShieldCheck,
    Smartphone,
    UserRound,
} from "lucide-react";

import { useState } from "react";

import "./Settings.css";

const Settings = () => {
    const [notifications, setNotifications] = useState(true);
    const [workoutReminders, setWorkoutReminders] =
        useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [privateProfile, setPrivateProfile] =
        useState(false);

    return (
        <section className="settings-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="settings-header">

                <div>
                    <span className="settings-eyebrow">
                        SETTINGS
                    </span>

                    <h1>
                        Customize your experience.
                    </h1>

                    <p>
                        Manage your preferences, privacy,
                        notifications, and account security.
                    </p>
                </div>

                <div className="settings-header__icon">
                    <ShieldCheck size={24} />
                </div>

            </header>

            {/* =========================================
                PREFERENCES
            ========================================= */}

            <section className="settings-section">

                <div className="settings-section__heading">
                    <div>
                        <span>
                            PREFERENCES
                        </span>

                        <h2>
                            App experience
                        </h2>
                    </div>

                    <Moon size={20} />
                </div>

                <div className="settings-card">

                    <div className="settings-row">

                        <div className="settings-row__icon">
                            <Moon size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Dark mode
                            </strong>

                            <span>
                                Use the premium dark interface
                                throughout FitTrack.
                            </span>
                        </div>

                        <button
                            type="button"
                            className={`settings-toggle ${
                                darkMode
                                    ? "settings-toggle--active"
                                    : ""
                            }`}
                            onClick={() =>
                                setDarkMode(
                                    (previous) =>
                                        !previous
                                )
                            }
                            aria-label="Toggle dark mode"
                        >
                            <span />
                        </button>

                    </div>

                    <div className="settings-divider" />

                    <div className="settings-row">

                        <div className="settings-row__icon">
                            <Globe size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Language
                            </strong>

                            <span>
                                Choose your preferred
                                application language.
                            </span>
                        </div>

                        <button
                            type="button"
                            className="settings-select"
                        >
                            English
                            <ChevronRight size={16} />
                        </button>

                    </div>

                </div>

            </section>

            {/* =========================================
                NOTIFICATIONS
            ========================================= */}

            <section className="settings-section">

                <div className="settings-section__heading">
                    <div>
                        <span>
                            NOTIFICATIONS
                        </span>

                        <h2>
                            Stay informed
                        </h2>
                    </div>

                    <Bell size={20} />
                </div>

                <div className="settings-card">

                    <div className="settings-row">

                        <div className="settings-row__icon settings-row__icon--blue">
                            <Bell size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Push notifications
                            </strong>

                            <span>
                                Receive important updates and
                                achievement notifications.
                            </span>
                        </div>

                        <button
                            type="button"
                            className={`settings-toggle ${
                                notifications
                                    ? "settings-toggle--active"
                                    : ""
                            }`}
                            onClick={() =>
                                setNotifications(
                                    (previous) =>
                                        !previous
                                )
                            }
                            aria-label="Toggle notifications"
                        >
                            <span />
                        </button>

                    </div>

                    <div className="settings-divider" />

                    <div className="settings-row">

                        <div className="settings-row__icon settings-row__icon--orange">
                            <Smartphone size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Workout reminders
                            </strong>

                            <span>
                                Get reminded when it's time
                                for your scheduled workout.
                            </span>
                        </div>

                        <button
                            type="button"
                            className={`settings-toggle ${
                                workoutReminders
                                    ? "settings-toggle--active"
                                    : ""
                            }`}
                            onClick={() =>
                                setWorkoutReminders(
                                    (previous) =>
                                        !previous
                                )
                            }
                            aria-label="Toggle workout reminders"
                        >
                            <span />
                        </button>

                    </div>

                </div>

            </section>

            {/* =========================================
                PRIVACY
            ========================================= */}

            <section className="settings-section">

                <div className="settings-section__heading">
                    <div>
                        <span>
                            PRIVACY
                        </span>

                        <h2>
                            Control your visibility
                        </h2>
                    </div>

                    <Lock size={20} />
                </div>

                <div className="settings-card">

                    <div className="settings-row">

                        <div className="settings-row__icon settings-row__icon--green">
                            <UserRound size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Private profile
                            </strong>

                            <span>
                                Hide your profile activity
                                from other users.
                            </span>
                        </div>

                        <button
                            type="button"
                            className={`settings-toggle ${
                                privateProfile
                                    ? "settings-toggle--active"
                                    : ""
                            }`}
                            onClick={() =>
                                setPrivateProfile(
                                    (previous) =>
                                        !previous
                                )
                            }
                            aria-label="Toggle private profile"
                        >
                            <span />
                        </button>

                    </div>

                </div>

            </section>

            {/* =========================================
                SECURITY
            ========================================= */}

            <section className="settings-section">

                <div className="settings-section__heading">
                    <div>
                        <span>
                            SECURITY
                        </span>

                        <h2>
                            Account security
                        </h2>
                    </div>

                    <KeyRound size={20} />
                </div>

                <div className="settings-card">

                    <button
                        type="button"
                        className="settings-action"
                    >
                        <div className="settings-row__icon">
                            <KeyRound size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Change password
                            </strong>

                            <span>
                                Update your account password.
                            </span>
                        </div>

                        <ChevronRight size={18} />

                    </button>

                    <div className="settings-divider" />

                    <button
                        type="button"
                        className="settings-action"
                    >
                        <div className="settings-row__icon">
                            <ShieldCheck size={19} />
                        </div>

                        <div className="settings-row__content">
                            <strong>
                                Security settings
                            </strong>

                            <span>
                                Review your account security
                                and active sessions.
                            </span>
                        </div>

                        <ChevronRight size={18} />

                    </button>

                </div>

            </section>

            {/* =========================================
                DANGER ZONE
            ========================================= */}

            <section className="settings-section settings-section--danger">

                <div className="settings-section__heading">
                    <div>
                        <span>
                            ACCOUNT
                        </span>

                        <h2>
                            Account actions
                        </h2>
                    </div>
                </div>

                <div className="settings-card">

                    <button
                        type="button"
                        className="settings-danger-button"
                    >
                        Delete account
                    </button>

                </div>

            </section>

        </section>
    );
};

export default Settings;