import { useEffect, useMemo, useState } from "react";
import { Dumbbell } from "lucide-react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { apiRequest } from "../../lib/api.js";
import WorkoutHeader from "./WorkoutHeader/WorkoutHeader";
import ExerciseCard from "./ExerciseCard/ExerciseCard";
import WorkoutHistory from "./WorkoutHistory/WorkoutHistory";
import "./Workouts.css";

const initialExercises = [
    { id: "pullups", name: "Weighted Pullups", sets: 4, reps: 8 },
    { id: "rows", name: "Seated Rows", sets: 3, reps: 12 },
    { id: "curls", name: "Bicep Curls", sets: 3, reps: 15 },
];

const createRows = (sets) => Array.from({ length: sets }, (_, index) => ({
    set: index + 1,
    weight: "",
    reps: "",
    completed: false,
}));

export default function Workouts() {
    const [title, setTitle] = useState("Strength Workout");
    const [exerciseRows, setExerciseRows] = useState(() =>
        Object.fromEntries(initialExercises.map((exercise) => [
            exercise.id,
            createRows(exercise.sets),
        ]))
    );
    const [history, setHistory] = useState([]);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [startedAt, setStartedAt] = useState(() => new Date());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/workouts")
            .then((result) => {
                if (isCurrent) setHistory(result.workouts);
            })
            .catch((requestError) => {
                if (isCurrent) setError(requestError.message);
            });
        return () => { isCurrent = false; };
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000));
        }, 1000);
        return () => window.clearInterval(timer);
    }, [startedAt]);

    const durationMinutes = Math.floor(elapsedSeconds / 60);
    const completedSets = useMemo(
        () => Object.values(exerciseRows).flat().filter((row) => row.completed),
        [exerciseRows],
    );

    const updateRows = (id, rows) => {
        setExerciseRows((current) => ({ ...current, [id]: rows }));
    };

    const finishWorkout = async () => {
        if (!completedSets.length || isSaving) return;
        setError("");
        setIsSaving(true);
        try {
            const result = await apiRequest("/workouts", {
                method: "POST",
                body: JSON.stringify({
                    title,
                    durationMinutes: Math.max(1, durationMinutes),
                    calories: Math.max(1, Math.round(Math.max(1, durationMinutes) * 7)),
                    exercises: initialExercises.map((exercise) => ({
                        name: exercise.name,
                        sets: exerciseRows[exercise.id].filter((row) => row.completed),
                    })).filter((exercise) => exercise.sets.length),
                    startedAt: startedAt.toISOString(),
                    completedAt: new Date().toISOString(),
                }),
            });
            setHistory((current) => [result.workout, ...current]);
            setExerciseRows(Object.fromEntries(initialExercises.map((exercise) => [
                exercise.id,
                createRows(exercise.sets),
            ])));
            setTitle("Strength Workout");
            setStartedAt(new Date());
            setElapsedSeconds(0);
            setError("Workout saved successfully.");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    };

    const formattedHistory = history.map((workout) => ({
        id: workout.id,
        name: workout.title,
        date: new Date(workout.createdAt).toLocaleDateString(),
    }));

    return (
        <div className="workouts-page page">
            <WorkoutHeader
                title={title}
                onTitleChange={setTitle}
                duration={`${Math.floor(elapsedSeconds / 60)}m`}
                calories={`${Math.max(1, Math.round(Math.max(1, durationMinutes) * 7))} kcal`}
                visual={<FitnessVisual3D icon={Dumbbell} variant="violet" />}
            />
            {error && (
                <p className={error === "Workout saved successfully." ? "app-success" : "app-error"} role="status">
                    {error}
                </p>
            )}
            <section className="workout-exercises">
                {initialExercises.map((exercise) => (
                    <ExerciseCard
                        key={exercise.id}
                        {...exercise}
                        entries={exerciseRows[exercise.id]}
                        onRowsChange={(rows) => updateRows(exercise.id, rows)}
                    />
                ))}
            </section>
            <section className="workout-actions">
                <button
                    className="finish-workout-button"
                    type="button"
                    onClick={finishWorkout}
                    disabled={isSaving || completedSets.length === 0}
                >
                    {isSaving ? "Saving..." : `Finish Workout (${completedSets.length} sets)`}
                </button>
            </section>
            <WorkoutHistory workouts={formattedHistory} />
        </div>
    );
}
