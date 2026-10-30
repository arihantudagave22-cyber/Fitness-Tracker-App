import SetRow from "../SetRow/SetRow";

import "./ExerciseCard.css";

export default function ExerciseCard({
    name,
    sets,
    reps,
    entries,
    onRowsChange,
}) {
    const updateRow = (index, nextRow) => {
        onRowsChange(
            entries.map((row, rowIndex) =>
                rowIndex === index ? nextRow : row
            ),
        );
    };

    return (
        <article className="exercise-card">
            <div className="exercise-card__header">
                <h3>{name}</h3>

                <span className="exercise-card__prescription">
                    {sets} Sets x {reps} Reps
                </span>
            </div>

            <div className="exercise-card__sets">
                {entries.map((row, index) => (
                    <SetRow
                        key={row.set}
                        {...row}
                        onChange={(nextRow) =>
                            updateRow(index, nextRow)
                        }
                    />
                ))}
            </div>
        </article>
    );
}