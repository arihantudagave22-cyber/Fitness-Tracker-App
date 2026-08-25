import {
    ArrowRight,
    CheckCircle2,
    Flame,
    Medal,
    Target,
    Trophy,
    Users,
    X,
} from "lucide-react";

import "./ChallengeModal.css";

const ChallengeModal = ({
    challenge,
    onClose,
    onProgress,
}) => {
    if (!challenge) {
        return null;
    }

    const Icon = challenge.icon;

    const percentage = Math.min(
        Math.round(
            (challenge.progress /
                challenge.target) *
                100
        ),
        100
    );

    return (
        <div
            className="challenge-modal-overlay"
            onMouseDown={onClose}
        >
            <section
                className="challenge-modal"
                onMouseDown={(event) =>
                    event.stopPropagation()
                }
                role="dialog"
                aria-modal="true"
                aria-labelledby="challenge-modal-title"
            >
                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="challenge-modal__header">

                    <div className="challenge-modal__icon">
                        <Icon
                            size={24}
                            strokeWidth={2}
                        />
                    </div>

                    <button
                        type="button"
                        className="challenge-modal__close"
                        onClick={onClose}
                        aria-label="Close challenge"
                    >
                        <X size={19} />
                    </button>

                </div>

                {/* =========================================
                    CONTENT
                ========================================= */}

                <div className="challenge-modal__content">

                    <span className="challenge-modal__eyebrow">
                        ACTIVE CHALLENGE
                    </span>

                    <h2 id="challenge-modal-title">
                        {challenge.title}
                    </h2>

                    <p className="challenge-modal__description">
                        {challenge.description}
                    </p>

                    {/* =========================================
                        PROGRESS
                    ========================================= */}

                    <div className="challenge-modal__progress">

                        <div className="challenge-modal__progress-header">

                            <span>
                                Current progress
                            </span>

                            <strong>
                                {percentage}%
                            </strong>

                        </div>

                        <div className="challenge-modal__progress-track">

                            <div
                                className="challenge-modal__progress-bar"
                                style={{
                                    width: `${percentage}%`,
                                }}
                            />

                        </div>

                        <div className="challenge-modal__progress-values">

                            <span>
                                {challenge.progress.toLocaleString()}{" "}
                                {challenge.unit}
                            </span>

                            <span>
                                {challenge.target.toLocaleString()}{" "}
                                {challenge.unit}
                            </span>

                        </div>

                    </div>

                    {/* =========================================
                        DETAILS
                    ========================================= */}

                    <div className="challenge-modal__details">

                        <div className="challenge-modal__detail">

                            <div className="challenge-modal__detail-icon">
                                <Trophy size={17} />
                            </div>

                            <div>
                                <span>
                                    Reward
                                </span>

                                <strong>
                                    {challenge.reward}
                                </strong>
                            </div>

                        </div>

                        <div className="challenge-modal__detail">

                            <div className="challenge-modal__detail-icon">
                                <Users size={17} />
                            </div>

                            <div>
                                <span>
                                    Participants
                                </span>

                                <strong>
                                    {challenge.participants.toLocaleString()}
                                </strong>
                            </div>

                        </div>

                    </div>

                    {/* =========================================
                        MOTIVATION
                    ========================================= */}

                    <div className="challenge-modal__motivation">

                        <div className="challenge-modal__motivation-icon">
                            <Flame size={17} />
                        </div>

                        <div>
                            <strong>
                                Keep going!
                            </strong>

                            <span>
                                You're {percentage}% of
                                the way there.
                            </span>
                        </div>

                    </div>

                </div>

                {/* =========================================
                    FOOTER
                ========================================= */}

                <div className="challenge-modal__footer">

                    <button
                        type="button"
                        className="challenge-modal__secondary"
                        onClick={onClose}
                    >
                        Close
                    </button>

                    <button
                        type="button"
                        className="challenge-modal__primary"
                        onClick={onProgress}
                    >
                        <CheckCircle2
                            size={17}
                        />

                        Mark progress

                        <ArrowRight
                            size={16}
                        />
                    </button>

                </div>

            </section>
        </div>
    );
};

export default ChallengeModal;