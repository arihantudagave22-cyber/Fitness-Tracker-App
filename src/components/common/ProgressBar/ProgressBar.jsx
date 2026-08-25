import "./ProgressBar.css";

const ProgressBar = ({
    value = 0,
    max = 100,
    label,
    showValue = true,
    size = "medium",
    variant = "primary",
}) => {
    const percentage = Math.min(
        100,
        Math.max(0, (value / max) * 100)
    );

    return (
        <div className="progress-bar">
            {(label || showValue) && (
                <div className="progress-bar__header">
                    {label && (
                        <span className="progress-bar__label">
                            {label}
                        </span>
                    )}

                    {showValue && (
                        <span className="progress-bar__value">
                            {Math.round(percentage)}%
                        </span>
                    )}
                </div>
            )}

            <div
                className={`progress-bar__track progress-bar__track--${size}`}
            >
                <div
                    className={`progress-bar__fill progress-bar__fill--${variant}`}
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;