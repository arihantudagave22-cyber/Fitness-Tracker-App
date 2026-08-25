import {
    Award,
    CalendarDays,
    Camera,
    Check,
    Flame,
    Mail,
    MapPin,
    Pencil,
    Target,
    Trophy,
    UserRound,
} from "lucide-react";

import { useState } from "react";

import "./Profile.css";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        name: "Alex Morgan",
        email: "alex.morgan@gmail.com",
        location: "Bengaluru, India",
        bio: "Focused on becoming stronger, healthier, and more consistent every day.",
        goal: "Build strength & improve fitness",
    });

    const handleChange = (event) => {
        const { name, value } = event.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSave = () => {
        setIsEditing(false);
    };

    return (
        <section className="profile-page">

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

                <button
                    type="button"
                    className="profile-edit-button"
                    onClick={() =>
                        isEditing
                            ? handleSave()
                            : setIsEditing(true)
                    }
                >
                    {isEditing ? (
                        <>
                            <Check size={17} />
                            Save changes
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

                        {isEditing && (
                            <button
                                type="button"
                                className="profile-avatar-edit"
                                aria-label="Change profile picture"
                            >
                                <Camera size={15} />
                            </button>
                        )}

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
                                Fitness level
                            </span>

                            <strong>
                                Level 12
                            </strong>
                        </div>

                        <div className="profile-level__track">
                            <div
                                className="profile-level__bar"
                                style={{
                                    width: "72%",
                                }}
                            />
                        </div>

                        <span className="profile-level__hint">
                            720 / 1000 XP to Level 13
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
                                <input
                                    id="profile-email"
                                    name="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                />
                            ) : (
                                <div className="profile-field__value">
                                    {profile.email}
                                </div>
                            )}

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

                        <strong>
                            7 Day Streak
                        </strong>

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
                            Completed 12 challenges
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
                            78% goal completion
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
                            2,450 XP earned
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
                            18
                        </strong>

                        <span>
                            Total workouts
                        </span>
                    </div>

                    <div>
                        <strong>
                            4
                        </strong>

                        <span>
                            This week
                        </span>
                    </div>

                    <div>
                        <strong>
                            12
                        </strong>

                        <span>
                            Challenges completed
                        </span>
                    </div>

                    <div>
                        <strong>
                            2,450
                        </strong>

                        <span>
                            Total XP
                        </span>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default Profile;