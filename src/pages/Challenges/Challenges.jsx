import {
    ArrowRight,
    Flame,
    Medal,
    Target,
    Trophy,
    Users,
} from "lucide-react";

import { useState } from "react";

import ChallengeModal from "../../components/challenges/ChallengeModal/ChallengeModal";

import "./Challenges.css";

const initialChallenges = [
    {
        id: 1,
        title: "7 Day Streak",
        description:
            "Complete at least one workout every day for 7 consecutive days.",
        icon: Flame,
        progress: 5,
        target: 7,
        unit: "days",
        reward: "150 XP",
        participants: 1248,
        status: "active",
    },
    {
        id: 2,
        title: "10K Steps",
        description:
            "Reach 10,000 steps in a single day and push your daily activity.",
        icon: Target,
        progress: 7200,
        target: 10000,
        unit: "steps",
        reward: "100 XP",
        participants: 896,
        status: "active",
    },
    {
        id: 3,
        title: "Strength Builder",
        description:
            "Complete 12 strength workouts and build a consistent routine.",
        icon: Medal,
        progress: 8,
        target: 12,
        unit: "workouts",
        reward: "250 XP",
        participants: 634,
        status: "active",
    },
    {
        id: 4,
        title: "Monthly Warrior",
        description:
            "Complete 20 workouts this month and become a consistency champion.",
        icon: Trophy,
        progress: 14,
        target: 20,
        unit: "workouts",
        reward: "500 XP",
        participants: 421,
        status: "active",
    },
];

const Challenges = () => {
    const [challengeList, setChallengeList] =
        useState(initialChallenges);

    const [selectedChallenge, setSelectedChallenge] =
        useState(null);

    /* =========================================
       UPDATE CHALLENGE PROGRESS
    ========================================= */

    const handleProgress = () => {
        if (!selectedChallenge) {
            return;
        }

        setChallengeList((previousChallenges) =>
            previousChallenges.map((challenge) => {
                if (
                    challenge.id !==
                    selectedChallenge.id
                ) {
                    return challenge;
                }

                const updatedProgress = Math.min(
                    challenge.progress + 1,
                    challenge.target
                );

                return {
                    ...challenge,
                    progress: updatedProgress,
                    status:
                        updatedProgress >=
                        challenge.target
                            ? "completed"
                            : "active",
                };
            })
        );

        setSelectedChallenge(
            (previousChallenge) => {
                if (!previousChallenge) {
                    return null;
                }

                const updatedProgress =
                    Math.min(
                        previousChallenge.progress +
                            1,
                        previousChallenge.target
                    );

                return {
                    ...previousChallenge,
                    progress:
                        updatedProgress,
                    status:
                        updatedProgress >=
                        previousChallenge.target
                            ? "completed"
                            : "active",
                };
            }
        );
    };

    return (
        <section className="challenges-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="challenges-header">

                <div>

                    <span className="challenges-eyebrow">
                        CHALLENGE HUB
                    </span>

                    <h1>
                        Push your limits.
                    </h1>

                    <p>
                        Take on challenges, build
                        consistency, and earn rewards
                        along the way.
                    </p>

                </div>

                <div className="challenges-header__badge">

                    <Trophy size={18} />

                    <div>

                        <strong>
                            2,450 XP
                        </strong>

                        <span>
                            Total earned
                        </span>

                    </div>

                </div>

            </header>

            {/* =========================================
                STATS
            ========================================= */}

            <div className="challenge-stats">

                <div className="challenge-stat">

                    <div className="challenge-stat__icon">
                        <Trophy size={19} />
                    </div>

                    <div>

                        <span>
                            Active challenges
                        </span>

                        <strong>
                            {
                                challengeList.filter(
                                    (challenge) =>
                                        challenge.status ===
                                        "active"
                                ).length
                            }
                        </strong>

                    </div>

                </div>

                <div className="challenge-stat">

                    <div className="challenge-stat__icon">
                        <Flame size={19} />
                    </div>

                    <div>

                        <span>
                            Current streak
                        </span>

                        <strong>
                            7 days
                        </strong>

                    </div>

                </div>

                <div className="challenge-stat">

                    <div className="challenge-stat__icon">
                        <Medal size={19} />
                    </div>

                    <div>

                        <span>
                            Completed
                        </span>

                        <strong>
                            {
                                challengeList.filter(
                                    (challenge) =>
                                        challenge.status ===
                                        "completed"
                                ).length
                            }
                        </strong>

                    </div>

                </div>

                <div className="challenge-stat">

                    <div className="challenge-stat__icon">
                        <Target size={19} />
                    </div>

                    <div>

                        <span>
                            Completion rate
                        </span>

                        <strong>
                            {
                                Math.round(
                                    (challengeList.filter(
                                        (challenge) =>
                                            challenge.status ===
                                            "completed"
                                    ).length /
                                        challengeList.length) *
                                        100
                                )
                            }
                            %
                        </strong>

                    </div>

                </div>

            </div>

            {/* =========================================
                SECTION HEADER
            ========================================= */}

            <div className="challenges-section-header">

                <div>

                    <span>
                        YOUR CHALLENGES
                    </span>

                    <h2>
                        Keep the momentum going
                    </h2>

                </div>

                <button
                    type="button"
                    className="challenges-view-button"
                >
                    View history

                    <ArrowRight size={15} />
                </button>

            </div>

            {/* =========================================
                CHALLENGE GRID
            ========================================= */}

            <div className="challenge-grid">

                {challengeList.map(
                    (challenge) => {
                        const Icon =
                            challenge.icon;

                        const percentage =
                            Math.min(
                                Math.round(
                                    (challenge.progress /
                                        challenge.target) *
                                        100
                                ),
                                100
                            );

                        const isCompleted =
                            challenge.status ===
                            "completed";

                        return (
                            <article
                                className="challenge-card"
                                key={challenge.id}
                            >

                                {/* CARD TOP */}

                                <div className="challenge-card__top">

                                    <div className="challenge-card__icon">
                                        <Icon
                                            size={21}
                                            strokeWidth={2}
                                        />
                                    </div>

                                    <span
                                        className={`challenge-card__status ${
                                            isCompleted
                                                ? "challenge-card__status--completed"
                                                : ""
                                        }`}
                                    >
                                        {isCompleted
                                            ? "COMPLETED"
                                            : "ACTIVE"}
                                    </span>

                                </div>

                                {/* CARD CONTENT */}

                                <div className="challenge-card__content">

                                    <h3>
                                        {
                                            challenge.title
                                        }
                                    </h3>

                                    <p>
                                        {
                                            challenge.description
                                        }
                                    </p>

                                </div>

                                {/* PROGRESS */}

                                <div className="challenge-progress">

                                    <div className="challenge-progress__header">

                                        <span>
                                            Progress
                                        </span>

                                        <strong>
                                            {
                                                percentage
                                            }
                                            %
                                        </strong>

                                    </div>

                                    <div className="challenge-progress__track">

                                        <div
                                            className="challenge-progress__bar"
                                            style={{
                                                width: `${percentage}%`,
                                            }}
                                        />

                                    </div>

                                    <div className="challenge-progress__values">

                                        <span>
                                            {challenge.progress.toLocaleString()}{" "}
                                            {
                                                challenge.unit
                                            }
                                        </span>

                                        <span>
                                            {challenge.target.toLocaleString()}{" "}
                                            {
                                                challenge.unit
                                            }
                                        </span>

                                    </div>

                                </div>

                                {/* CARD FOOTER */}

                                <div className="challenge-card__footer">

                                    <div className="challenge-reward">

                                        <Trophy
                                            size={15}
                                        />

                                        <span>
                                            {
                                                challenge.reward
                                            }
                                        </span>

                                    </div>

                                    <div className="challenge-participants">

                                        <Users
                                            size={15}
                                        />

                                        <span>
                                            {challenge.participants.toLocaleString()}
                                        </span>

                                    </div>

                                </div>

                                {/* ACTION */}

                                <button
                                    type="button"
                                    className="challenge-card__button"
                                    onClick={() =>
                                        setSelectedChallenge(
                                            challenge
                                        )
                                    }
                                    disabled={
                                        isCompleted
                                    }
                                >
                                    {isCompleted
                                        ? "Challenge completed"
                                        : "Continue challenge"}

                                    {!isCompleted && (
                                        <ArrowRight
                                            size={16}
                                        />
                                    )}

                                </button>

                            </article>
                        );
                    }
                )}

            </div>

            {/* =========================================
                CHALLENGE MODAL
            ========================================= */}

            <ChallengeModal
                challenge={
                    selectedChallenge
                }
                onClose={() =>
                    setSelectedChallenge(
                        null
                    )
                }
                onProgress={
                    handleProgress
                }
            />

        </section>
    );
};

export default Challenges;