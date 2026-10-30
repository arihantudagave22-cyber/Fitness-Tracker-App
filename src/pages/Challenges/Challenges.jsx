import { ArrowRight, Flame, Medal, Target, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import ChallengeModal from "../../components/challenges/ChallengeModal/ChallengeModal";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { apiRequest } from "../../lib/api.js";
import "./Challenges.css";

const challengeIcons = {
    "7-day-streak": Flame,
    "10k-steps": Target,
    "strength-builder": Medal,
    "monthly-warrior": Trophy,
};

const Challenges = () => {
    const [challengeList, setChallengeList] = useState([]);
    const [selectedChallenge, setSelectedChallenge] = useState(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/challenges")
            .then((result) => {
                if (isCurrent) setChallengeList(result.challenges);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            });
        return () => { isCurrent = false; };
    }, []);

    const handleProgress = async () => {
        if (!selectedChallenge || isSaving) return;
        setError("");
        setIsSaving(true);
        try {
            const result = await apiRequest(
                `/challenges/${encodeURIComponent(selectedChallenge.key)}/progress`,
                { method: "POST" },
            );
            setChallengeList((current) => current.map((challenge) =>
                challenge.key === result.challenge.key ? result.challenge : challenge
            ));
            setSelectedChallenge({
                ...result.challenge,
                icon: challengeIcons[result.challenge.key] ?? Trophy,
            });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (error && challengeList.length === 0) {
        return <p className="app-error" role="alert">{error}</p>;
    }

    const completed = challengeList.filter((challenge) => challenge.status === "completed").length;
    const active = challengeList.length - completed;

    return (
        <section className="challenges-page">
            <header className="challenges-header">
                <div>
                    <span className="challenges-eyebrow">CHALLENGE HUB</span>
                    <h1>Push your limits.</h1>
                    <p>Track challenge progress as you build consistency.</p>
                </div>
                <FitnessVisual3D icon={Trophy} variant="orange" />
                <div className="challenges-header__badge">
                    <Trophy size={18} />
                    <div><strong>{completed} completed</strong><span>Your milestones</span></div>
                </div>
            </header>

            {error && <p className="app-error" role="alert">{error}</p>}
            {!challengeList.length && !error && <p role="status">Loading challenges...</p>}

            <div className="challenge-stats">
                <div className="challenge-stat"><strong>{challengeList.length}</strong><span>Total challenges</span></div>
                <div className="challenge-stat"><strong>{active}</strong><span>In progress</span></div>
                <div className="challenge-stat"><strong>{completed}</strong><span>Completed</span></div>
            </div>

            <div className="challenge-grid">
                {challengeList.map((challenge) => {
                    const Icon = challengeIcons[challenge.key] ?? Trophy;
                    const isCompleted = challenge.status === "completed";
                    const percentage = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
                    return (
                        <article className="challenge-card" key={challenge.key}>
                            <div className="challenge-card__header">
                                <div className="challenge-card__icon"><Icon size={22} /></div>
                                <span className={`challenge-card__status ${isCompleted ? "challenge-card__status--completed" : ""}`}>
                                    {isCompleted ? "COMPLETED" : "IN PROGRESS"}
                                </span>
                            </div>
                            <h2>{challenge.title}</h2>
                            <p>{challenge.description}</p>
                            <div className="challenge-progress">
                                <div className="challenge-progress__header">
                                    <span>Your progress</span><strong>{percentage}%</strong>
                                </div>
                                <div className="challenge-progress__track">
                                    <div className="challenge-progress__bar" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="challenge-progress__values">
                                    <span>{challenge.progress.toLocaleString()} {challenge.unit}</span>
                                    <span>{challenge.target.toLocaleString()} {challenge.unit}</span>
                                </div>
                            </div>
                            <div className="challenge-card__footer">
                                <span><Trophy size={15} /> {challenge.reward}</span>
                            </div>
                            <button
                                type="button"
                                className="challenge-card__button"
                                onClick={() => setSelectedChallenge({ ...challenge, icon: Icon })}
                                disabled={isCompleted}
                            >
                                {isCompleted ? "Challenge completed" : "View challenge"}
                                {!isCompleted && <ArrowRight size={16} />}
                            </button>
                        </article>
                    );
                })}
            </div>

            <ChallengeModal
                challenge={selectedChallenge}
                onClose={() => setSelectedChallenge(null)}
                onProgress={handleProgress}
                isSaving={isSaving}
            />
        </section>
    );
};

export default Challenges;
