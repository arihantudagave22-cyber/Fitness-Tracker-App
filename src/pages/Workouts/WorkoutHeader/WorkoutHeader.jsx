import { Timer, Flame } from "lucide-react";

import "./WorkoutHeader.css";

export default function WorkoutHeader({
    title,
    duration,
    calories,
    onTitleChange,
    visual,
}) {
    return (
        <section className="workout-header">
            <div className="workout-header__top">
                <div>
                    <span className="workout-header__eyebrow">TRAINING SESSION</span>
                    <h1 className="workout-page-title">
                        Today's Workout
                    </h1>
                </div>
                {visual}
            </div>

            <div className="workout-header__details">
                <input
                    className="workout-title-input"
                    aria-label="Workout title"
                    value={title}
                    onChange={(event) => onTitleChange(event.target.value)}
                    maxLength={120}
                />

                <div className="workout-header__stats">
                    <span className="workout-chip workout-chip--cyan">
                        <Timer size={14} />
                        {duration}
                    </span>

                    <span className="workout-chip workout-chip--green">
                        <Flame size={14} />
                        {calories}
                    </span>
                </div>
            </div>
        </section>
    );
}