import {
    ArrowRight,
    Clock3,
    Dumbbell,
    Flame,
    MoreHorizontal,
    Play,
    Plus,
    Timer,
} from "lucide-react";

import { useMemo, useState } from "react";

import Button from "../../components/common/Button/Button";
import Card from "../../components/common/Card/Card";

import "./Workouts.css";

const initialWorkouts = [
    {
        id: 1,
        title: "Push Strength",
        category: "Strength",
        duration: 45,
        calories: 320,
        exercises: 6,
        intensity: "High",
        status: "completed",
    },
    {
        id: 2,
        title: "Lower Body Power",
        category: "Legs",
        duration: 50,
        calories: 410,
        exercises: 7,
        intensity: "High",
        status: "planned",
    },
    {
        id: 3,
        title: "Full Body Mobility",
        category: "Mobility",
        duration: 25,
        calories: 160,
        exercises: 5,
        intensity: "Medium",
        status: "planned",
    },
    {
        id: 4,
        title: "Upper Body Volume",
        category: "Upper Body",
        duration: 40,
        calories: 290,
        exercises: 8,
        intensity: "Medium",
        status: "planned",
    },
];

const filterOptions = [
    "All",
    "Strength",
    "Legs",
    "Mobility",
    "Upper Body",
];

const Workouts = () => {
    const [workouts] = useState(initialWorkouts);
    const [activeFilter, setActiveFilter] = useState("All");

    const filteredWorkouts = useMemo(() => {
        if (activeFilter === "All") {
            return workouts;
        }

        return workouts.filter(
            (workout) =>
                workout.category === activeFilter
        );
    }, [activeFilter, workouts]);

    return (
        <section className="workouts-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="workouts-header">

                <div>
                    <span className="workouts-eyebrow">
                        WORKOUT HUB
                    </span>

                    <h1>
                        Train with purpose.
                    </h1>

                    <p>
                        Plan your sessions, stay consistent,
                        and keep your fitness momentum going.
                    </p>
                </div>

                <Button
                    size="large"
                    icon={<Plus size={18} />}
                >
                    New Workout
                </Button>

            </header>

            {/* =========================================
                OVERVIEW
            ========================================= */}

            <div className="workout-overview">

                <div className="workout-overview__item">
                    <div className="workout-overview__icon">
                        <Dumbbell size={19} />
                    </div>

                    <div>
                        <span>
                            This week
                        </span>

                        <strong>
                            4 workouts
                        </strong>
                    </div>
                </div>

                <div className="workout-overview__item">
                    <div className="workout-overview__icon workout-overview__icon--success">
                        <Timer size={19} />
                    </div>

                    <div>
                        <span>
                            Total time
                        </span>

                        <strong>
                            160 min
                        </strong>
                    </div>
                </div>

                <div className="workout-overview__item">
                    <div className="workout-overview__icon workout-overview__icon--warning">
                        <Flame size={19} />
                    </div>

                    <div>
                        <span>
                            Calories
                        </span>

                        <strong>
                            1,180 kcal
                        </strong>
                    </div>
                </div>

                <div className="workout-overview__item">
                    <div className="workout-overview__icon workout-overview__icon--info">
                        <Clock3 size={19} />
                    </div>

                    <div>
                        <span>
                            Avg. session
                        </span>

                        <strong>
                            40 min
                        </strong>
                    </div>
                </div>

            </div>

            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="workouts-toolbar">

                <div>
                    <span className="workouts-toolbar__eyebrow">
                        YOUR WORKOUTS
                    </span>

                    <h2>
                        Training plan
                    </h2>
                </div>

                <div className="workout-filters">
                    {filterOptions.map(
                        (filter) => (
                            <button
                                key={filter}
                                type="button"
                                className={`workout-filter ${
                                    activeFilter ===
                                    filter
                                        ? "workout-filter--active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveFilter(
                                        filter
                                    )
                                }
                            >
                                {filter}
                            </button>
                        )
                    )}
                </div>

            </div>

            {/* =========================================
                WORKOUT GRID
            ========================================= */}

            <div className="workout-grid">

                {filteredWorkouts.map(
                    (workout) => (
                        <article
                            className="workout-card"
                            key={workout.id}
                        >
                            <div className="workout-card__top">

                                <div className="workout-card__icon">
                                    <Dumbbell
                                        size={21}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="workout-card__menu"
                                    aria-label={`More options for ${workout.title}`}
                                >
                                    <MoreHorizontal
                                        size={18}
                                    />
                                </button>

                            </div>

                            <div className="workout-card__content">

                                <div className="workout-card__status-row">

                                    <span
                                        className={`workout-card__status workout-card__status--${workout.status}`}
                                    >
                                        {workout.status ===
                                        "completed"
                                            ? "COMPLETED"
                                            : "PLANNED"}
                                    </span>

                                    <span className="workout-card__intensity">
                                        {workout.intensity}
                                    </span>

                                </div>

                                <h3>
                                    {workout.title}
                                </h3>

                                <span className="workout-card__category">
                                    {workout.category}
                                </span>

                            </div>

                            <div className="workout-card__meta">

                                <div>
                                    <Clock3
                                        size={15}
                                    />

                                    <span>
                                        {
                                            workout.duration
                                        }{" "}
                                        min
                                    </span>
                                </div>

                                <div>
                                    <Flame
                                        size={15}
                                    />

                                    <span>
                                        {
                                            workout.calories
                                        }{" "}
                                        kcal
                                    </span>
                                </div>

                                <div>
                                    <Dumbbell
                                        size={15}
                                    />

                                    <span>
                                        {
                                            workout.exercises
                                        }{" "}
                                        exercises
                                    </span>
                                </div>

                            </div>

                            <button
                                type="button"
                                className="workout-card__button"
                            >
                                <Play
                                    size={16}
                                    fill="currentColor"
                                />

                                {workout.status ===
                                "completed"
                                    ? "View workout"
                                    : "Start workout"}

                                <ArrowRight
                                    size={15}
                                />
                            </button>

                        </article>
                    )
                )}

            </div>

            {/* =========================================
                EMPTY STATE
            ========================================= */}

            {filteredWorkouts.length === 0 && (
                <Card className="workout-empty">
                    <Dumbbell
                        size={32}
                    />

                    <h3>
                        No workouts found
                    </h3>

                    <p>
                        Try another category or create
                        a new workout.
                    </p>
                </Card>
            )}

        </section>
    );
};

export default Workouts;