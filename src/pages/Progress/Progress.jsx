import {
    Activity,
    Flame,
    Target,
    Trophy,
    TrendingUp,
} from "lucide-react";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useEffect, useState } from "react";
import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import { apiRequest } from "../../lib/api.js";

import "./Progress.css";

const Progress = () => {
    const [period, setPeriod] = useState("week");
    const [progress, setProgress] = useState(null);
    const [requestError, setRequestError] = useState(null);

    useEffect(() => {
        let isCurrent = true;
        apiRequest(`/progress?period=${period}`)
            .then((result) => {
                if (isCurrent) setProgress(result.progress);
            })
            .catch((error) => {
                if (isCurrent) setRequestError({ period, message: error.message });
            });
        return () => { isCurrent = false; };
    }, [period]);

    if (requestError?.period === period) {
        return <p className="app-error" role="alert">{requestError.message}</p>;
    }
    if (progress?.period !== period) {
        return <p className="app-loading" role="status">Loading your progress...</p>;
    }

    const chartData = progress.chart;
    const totals = progress.totals;
    const goal = period === "week" ? 5 : 20;
    const goalPercent = Math.min(100, Math.round((totals.workouts / goal) * 100));

    return (
        <section className="progress-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <header className="progress-header">

                <div>
                    <span className="progress-eyebrow">
                        YOUR PROGRESS
                    </span>

                    <h1>
                        See how far you've come.
                    </h1>

                    <p>
                        Track your consistency, activity,
                        and performance over time.
                    </p>
                </div>

                <FitnessVisual3D icon={TrendingUp} variant="cyan" />

                <div className="progress-header__badge">
                    <TrendingUp size={18} />

                    <div>
                        <strong>
                            {totals.workouts}
                        </strong>

                        <span>
                            {period === "week" ? "Workouts this week" : "Workouts this month"}
                        </span>
                    </div>
                </div>

            </header>

            {/* =========================================
                SUMMARY
            ========================================= */}

            <div className="progress-stats">

                <div className="progress-stat">

                    <div className="progress-stat__icon">
                        <Activity size={19} />
                    </div>

                    <div>
                        <span>
                            Workouts
                        </span>

                        <strong>
                            {totals.workouts}
                        </strong>

                        <small>
                            {period === "week" ? "This week" : "This month"}
                        </small>
                    </div>

                </div>

                <div className="progress-stat">

                    <div className="progress-stat__icon progress-stat__icon--orange">
                        <Flame size={19} />
                    </div>

                    <div>
                        <span>
                            Calories burned
                        </span>

                        <strong>
                            {totals.calories.toLocaleString()}
                        </strong>

                        <small>
                            Calories logged
                        </small>
                    </div>

                </div>

                <div className="progress-stat">

                    <div className="progress-stat__icon progress-stat__icon--green">
                        <Target size={19} />
                    </div>

                    <div>
                        <span>
                            Goal completion
                        </span>

                        <strong>
                            {goalPercent}%
                        </strong>

                        <small>
                            {`${totals.workouts} of ${goal}`}
                        </small>
                    </div>

                </div>

                <div className="progress-stat">

                    <div className="progress-stat__icon progress-stat__icon--blue">
                        <Trophy size={19} />
                    </div>

                    <div>
                        <span>
                            Challenges completed
                        </span>

                        <strong>
                            {totals.completedChallenges}
                        </strong>

                        <small>
                            Challenges completed
                        </small>
                    </div>

                </div>

            </div>

            {/* =========================================
                CHART
            ========================================= */}

            <div className="progress-chart-card">

                <div className="progress-chart-card__header">

                    <div>
                        <span>
                            ACTIVITY
                        </span>

                        <h2>
                            Training activity
                        </h2>

                        <p>
                            Your workout activity and
                            calorie expenditure.
                        </p>
                    </div>

                    <div className="progress-period">

                        <button
                            type="button"
                            className={
                                period === "week"
                                    ? "progress-period--active"
                                    : ""
                            }
                            onClick={() =>
                                setPeriod("week")
                            }
                        >
                            Week
                        </button>

                        <button
                            type="button"
                            className={
                                period === "month"
                                    ? "progress-period--active"
                                    : ""
                            }
                            onClick={() =>
                                setPeriod("month")
                            }
                        >
                            Month
                        </button>

                    </div>

                </div>

                <div className="progress-chart">

                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart
                            data={chartData}
                            margin={{
                                top: 15,
                                right: 10,
                                left: -15,
                                bottom: 0,
                            }}
                        >

                            <defs>
                                <linearGradient
                                    id="progressGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="0%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0.35}
                                    />

                                    <stop
                                        offset="100%"
                                        stopColor="#8b5cf6"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                stroke="var(--border-light)"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "var(--text-muted)",
                                    fontSize: 11,
                                }}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fill: "var(--text-muted)",
                                    fontSize: 11,
                                }}
                                allowDecimals={false}
                            />

                            <Tooltip
                                contentStyle={{
                                    background:
                                        "var(--surface-elevated)",
                                    border:
                                        "1px solid var(--border-color)",
                                    borderRadius:
                                        "var(--radius-md)",
                                    color:
                                        "var(--text-primary)",
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="workouts"
                                stroke="var(--color-primary)"
                                strokeWidth={2}
                                fill="url(#progressGradient)"
                            />

                        </AreaChart>
                    </ResponsiveContainer>

                </div>

            </div>

            {/* =========================================
                PERFORMANCE
            ========================================= */}

            <div className="progress-performance">

                <article className="progress-performance-card">

                    <div className="progress-performance-card__header">

                        <div>
                            <span>
                                WEEKLY GOAL
                            </span>

                            <h3>
                                Workout consistency
                            </h3>
                        </div>

                        <Target size={19} />

                    </div>

                    <div className="progress-goal">

                        <strong>
                        {totals.workouts}
                        </strong>

                        <span>
                            / {goal} workouts
                        </span>

                    </div>

                    <div className="progress-goal-track">

                        <div
                            className="progress-goal-bar"
                            style={{
                                width: `${goalPercent}%`,
                            }}
                        />

                    </div>

                    <p>
                        {goalPercent >= 100
                            ? "You reached your workout goal for this period."
                            : `${Math.max(0, goal - totals.workouts)} more workout${goal - totals.workouts === 1 ? "" : "s"} to reach your goal.`}
                    </p>

                </article>

                <article className="progress-performance-card">

                    <div className="progress-performance-card__header">

                        <div>
                            <span>
                                PERFORMANCE
                            </span>

                            <h3>
                                This period
                            </h3>
                        </div>

                        <TrendingUp size={19} />

                    </div>

                    <div className="progress-comparison">

                        <div>
                            <Flame size={17} />
                            <strong>{totals.calories.toLocaleString()}</strong>
                            <span>Calories logged</span>
                        </div>
                        <div>
                            <Activity size={17} />
                            <strong>{totals.durationMinutes}</strong>
                            <span>Training minutes</span>
                        </div>

                    </div>

                </article>

            </div>

        </section>
    );
};

export default Progress;