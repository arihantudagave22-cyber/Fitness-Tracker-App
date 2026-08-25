import "./StatCard.css";

const StatCard = ({
    label,
    value,
    unit,
    icon,
    trend,
    trendLabel,
    variant = "primary",
}) => {
    return (
        <article className={`stat-card stat-card--${variant}`}>
            <div className="stat-card__top">
                <div className="stat-card__icon">
                    {icon}
                </div>

                {trend && (
                    <span className="stat-card__trend">
                        {trend}
                    </span>
                )}
            </div>

            <div className="stat-card__content">
                <span className="stat-card__label">
                    {label}
                </span>

                <div className="stat-card__value">
                    <strong>{value}</strong>

                    {unit && (
                        <span>{unit}</span>
                    )}
                </div>

                {trendLabel && (
                    <span className="stat-card__trend-label">
                        {trendLabel}
                    </span>
                )}
            </div>
        </article>
    );
};

export default StatCard;