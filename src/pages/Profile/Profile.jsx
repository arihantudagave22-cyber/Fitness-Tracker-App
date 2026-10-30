import {
    Award,
    CalendarDays,
    Check,
    Flame,
    Mail,
    MapPin,
    Pencil,
    Target,
    Trophy,
    UserRound,
} from "lucide-react";

import { useEffect, useState } from "react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { useAuth } from "../../context/AuthContext.js";
import { apiRequest } from "../../lib/api.js";

import "./Profile.css";

const Profile = () => {
    const { user, signIn } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState(user);
    const [activity, setActivity] = useState(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/dashboard")
            .then((result) => {
                if (isCurrent) setActivity(result.dashboard);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            });
        return () => { isCurrent = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        setError("");
        setIsSaving(true);
        try {
            const result = await apiRequest("/profile", {
                method: "PATCH",
                body: JSON.stringify({
                    name: profile.name,
                    location: profile.location ?? "",
                    bio: profile.bio ?? "",
                    goal: profile.goal ?? "",
                }),
            });
            setProfile(result.user);
            signIn(result.user);
            setIsEditing(false);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!profile) {
        return <p className="app-loading" role="status">Loading your profile...</p>;
    }

    return (
        <section className="profile-page">
            {error && <p className="app-error" role="alert">{error}</p>}

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="profile-header">

                <div>
                    <span className="profile-eyebrow">
                        YOUR PROFILE
                    </span>

                    <h1>
                        Personal fitness profile
                    </h1>

                    <p>
                        Manage your personal information,
                        goals, and fitness achievements.
                    </p>
                </div>

                <FitnessVisual3D icon={UserRound} variant="green" />

                <button
                    type="button"
                    className="profile-edit-button"
                    onClick={() =>
                        isEditing
                            ? handleSave()
                            : setIsEditing(true)
                    }
                    disabled={isSaving}
                >
                    {isEditing ? (
                        <>
                            <Check size={17} />
                            {isSaving ? "Saving..." : "Save changes"}
                        </>
                    ) : (
                        <>
                            <Pencil size={17} />
                            Edit profile
                        </>
                    )}
                </button>

            </header>

            {/* =========================================
                PROFILE OVERVIEW
            ========================================= */}

            <div className="profile-layout">

                <article className="profile-card profile-card--identity">

                    <div className="profile-avatar-wrapper">

                        <div className="profile-avatar">
                            <UserRound size={42} />
                        </div>

                    </div>

                    <div className="profile-identity">

                        <h2>
                            {profile.name}
                        </h2>

                        <span>
                            Fitness enthusiast
                        </span>

                    </div>

                    <div className="profile-identity-meta">

                        <div>
                            <Mail size={15} />
                            <span>
                                {profile.email}
                            </span>
                        </div>

                        <div>
                            <MapPin size={15} />
                            <span>
                                {profile.location}
                            </span>
                        </div>

                    </div>

                    <div className="profile-level">

                        <div className="profile-level__header">
                            <span>
                                Current streak
                            </span>

                            <strong>
                                {activity?.streak ?? 0} days
                            </strong>
                        </div>

                        <div className="profile-level__track">
                            <div
                                className="profile-level__bar"
                                style={{
                                    width: `${Math.min(100, ((activity?.streak ?? 0) / 7) * 100)}%`,
                                }}
                            />
                        </div>

                        <span className="profile-level__hint">
                            {activity?.streak ?? 0} consecutive days
                        </span>

                    </div>

                </article>

                {/* =========================================
                    PERSONAL INFORMATION
                ========================================= */}

                <article className="profile-card profile-card--details">

                    <div className="profile-card__heading">

                        <div>
                            <span>
                                PERSONAL INFORMATION
                            </span>

                            <h2>
                                About you
                            </h2>
                        </div>

                        <UserRound size={19} />

                    </div>

                    <div className="profile-form">

                        <div className="profile-field">

                            <label htmlFor="profile-name">
                                Full name
                            </label>

                            {isEditing ? (
                                <input
                                    id="profile-name"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="profile-field__value">
                                    {profile.name}
                                </div>
                            )}

                        </div>

                        <div className="profile-field">

                            <label htmlFor="profile-email">
                                Email address
                            </label>

                            {isEditing ? (
                                <div className="profile-field__value">{profile.email}</div>
                            ) : <div className="profile-field__value">{profile.email}</div>}

                        </div>

                        <div className="profile-field">

                            <label htmlFor="profile-location">
                                Location
                            </label>

                            {isEditing ? (
                                <input
                                    id="profile-location"
                                    name="location"
                                    value={profile.location}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="profile-field__value">
                                    {profile.location}
                                </div>
                            )}

                        </div>

                        <div className="profile-field">

                            <label htmlFor="profile-goal">
                                Primary goal
                            </label>

                            {isEditing ? (
                                <input
                                    id="profile-goal"
                                    name="goal"
                                    value={profile.goal}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="profile-field__value">
                                    {profile.goal}
                                </div>
                            )}

                        </div>

                        <div className="profile-field profile-field--full">

                            <label htmlFor="profile-bio">
                                Bio
                            </label>

                            {isEditing ? (
                                <textarea
                                    id="profile-bio"
                                    name="bio"
                                    rows="4"
                                    value={profile.bio}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="profile-field__value profile-field__value--bio">
                                    {profile.bio}
                                </div>
                            )}

                        </div>

                    </div>

                </article>

            </div>

            {/* =========================================
                ACHIEVEMENTS
            ========================================= */}

            <div className="profile-section">

                <div className="profile-section__heading">

                    <div>
                        <span>
                            ACHIEVEMENTS
                        </span>

                        <h2>
                            Your milestones
                        </h2>
                    </div>

                    <Trophy size={20} />

                </div>

                <div className="profile-achievements">

                    <article className="profile-achievement">
                        <div>
                            <Flame size={21} />
                        </div>

                        <strong>{activity?.streak ?? 0} Day Streak</strong>

                        <span>
                            Consistency champion
                        </span>
                    </article>

                    <article className="profile-achievement">
                        <div>
                            <Trophy size={21} />
                        </div>

                        <strong>
                            Challenge Master
                        </strong>

                        <span>
                            Completed {activity?.challenges.completed ?? 0} challenges
                        </span>
                    </article>

                    <article className="profile-achievement">
                        <div>
                            <Target size={21} />
                        </div>

                        <strong>
                            Goal Crusher
                        </strong>

                        <span>
                            {Math.min(100, Math.round(((activity?.totals.weeklyWorkouts ?? 0) / 5) * 100))}% weekly goal
                        </span>
                    </article>

                    <article className="profile-achievement">
                        <div>
                            <Award size={21} />
                        </div>

                        <strong>
                            Level 12
                        </strong>

                        <span>
                            Fitness activity
                        </span>
                    </article>

                </div>

            </div>

            {/* =========================================
                ACTIVITY
            ========================================= */}

            <div className="profile-section">

                <div className="profile-section__heading">

                    <div>
                        <span>
                            ACCOUNT ACTIVITY
                        </span>

                        <h2>
                            Your fitness journey
                        </h2>
                    </div>

                    <CalendarDays size={20} />

                </div>

                <div className="profile-activity">

                    <div>
                        <strong>
                            {activity?.totals.workoutCount ?? 0}
                        </strong>

                        <span>
                            Total workouts
                        </span>
                    </div>

                    <div>
                        <strong>
                            {activity?.totals.weeklyWorkouts ?? 0}
                        </strong>

                        <span>
                            This week
                        </span>
                    </div>

                    <div>
                        <strong>
                            {activity?.challenges.completed ?? 0}
                        </strong>

                        <span>
                            Challenges completed
                        </span>
                    </div>

                    <div>
                        <strong>
                            {activity?.streak ?? 0}
                        </strong>

                        <span>
                            Day streak
                        </span>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default Profile;