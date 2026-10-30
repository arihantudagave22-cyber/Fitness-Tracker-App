import { ChevronRight } from "lucide-react";

import "./WorkoutHistory.css";

export default function WorkoutHistory({
    workouts,
}) {
    return (
        <section className="workout-history">
            <h3>Recent Workouts</h3>

            <div className="workout-history__grid">
                {workouts.map((workout) => (
                    <button
                        type="button"
                        className="history-card"
                        key={workout.id}
                    >
                        <div>
                            <span className="history-card__name">
                                {workout.name}
                            </span>

                            <span className="history-card__date">
                                {workout.date}
                            </span>
                        </div>

                        <ChevronRight
                            size={20}
                            className="history-card__icon"
                        />
                    </button>
                ))}
            </div>
        </section>
    );
}