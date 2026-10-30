import { Minus, Plus, Check } from "lucide-react";

import "./SetRow.css";

export default function SetRow({
    set,
    weight,
    reps,
    completed,
    onChange,
}) {
    const updateField = (field, value) => {
        onChange({
            set,
            weight: field === "weight" ? value : weight,
            reps: field === "reps" ? value : reps,
            completed,
        });
    };

    const increment = (field, step = 1) => {
        const current =
            Number(field === "weight" ? weight : reps) || 0;

        updateField(field, current + step);
    };

    const decrement = (field, step = 1) => {
        const current =
            Number(field === "weight" ? weight : reps) || 0;

        updateField(
            field,
            Math.max(0, current - step)
        );
    };

    const toggleComplete = () => {
        onChange({
            set,
            weight,
            reps,
            completed: !completed,
        });
    };

    return (
        <div
            className={`set-row ${
                completed ? "set-row--completed" : ""
            }`}
        >
            <span className="set-row__number">
                {set}
            </span>

            <div className="set-row__controls">
                {/* WEIGHT */}
                <div className="stepper">
                    <button
                        type="button"
                        className="stepper__button"
                        onClick={() =>
                            decrement("weight", 2.5)
                        }
                    >
                        <Minus size={14} />
                    </button>

                    <div className="stepper__value">
                        <span className="stepper__number">
                            {weight || 0}
                        </span>

                        <span className="stepper__unit">
                            kg
                        </span>
                    </div>

                    <button
                        type="button"
                        className="stepper__button"
                        onClick={() =>
                            increment("weight", 2.5)
                        }
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* REPS */}
                <div className="stepper">
                    <button
                        type="button"
                        className="stepper__button"
                        onClick={() =>
                            decrement("reps", 1)
                        }
                    >
                        <Minus size={14} />
                    </button>

                    <div className="stepper__value">
                        <span className="stepper__number">
                            {reps || 0}
                        </span>

                        <span className="stepper__unit">
                            reps
                        </span>
                    </div>

                    <button
                        type="button"
                        className="stepper__button"
                        onClick={() =>
                            increment("reps", 1)
                        }
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <button
                type="button"
                className="set-row__check"
                onClick={toggleComplete}
                disabled={!completed && Number(reps) <= 0}
                aria-label={completed ? `Mark set ${set} incomplete` : `Complete set ${set}`}
            >
                <Check size={18} />
            </button>
        </div>
    );
}