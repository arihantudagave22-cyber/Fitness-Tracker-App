import {
    Activity,
    ArrowDown,
    ArrowUp,
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

import { useState } from "react";

import "./Progress.css";

const weeklyData = [
    {
        day: "Mon",
        workouts: 1,
        calories: 320,
    },
    {
        day: "Tue",
        workouts: 0,
        calories: 0,
    },
    {
        day: "Wed",
        workouts: 1,
        calories: 410,
    },
    {
        day: "Thu",
        workouts: 1,
        calories: 290,
    },
    {
        day: "Fri",
        workouts: 0,
        calories: 0,
    },
    {
        day: "Sat",
        workouts: 1,
        calories: 360,
    },
    {
        day: "Sun",
        workouts: 0,
        calories: 0,
    },
];

const monthlyData = [
    {
        day: "Week 1",
        workouts: 3,
        calories: 980,
    },
    {
        day: "Week 2",
        workouts: 4,
        calories: 1240,
    },
    {
        day: "Week 3",
        workouts: 5,
        calories: 1510,
    },
    {
        day: "Week 4",
        workouts: 4,
        calories: 1180,
    },
];

const Progress = () => {
    const [period, setPeriod] =
        useState("week");

    const chartData =
        period === "week"
            ? weeklyData
            : monthlyData;

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

                <div className="progress-header__badge">
                    <TrendingUp size={18} />

                    <div>
                        <strong>
                            +18.4%
                        </strong>

                        <span>
                            This month
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
                            18
                        </strong>

                        <small>
                            +4 this month
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
                            4,910
                        </strong>

                        <small>
                            +12.8%
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
                            78%
                        </strong>

                        <small>
                            +6.2%
                        </small>
                    </div>

                </div>

                <div className="progress-stat">

                    <div className="progress-stat__icon progress-stat__icon--blue">
                        <Trophy size={19} />
                    </div>

                    <div>
                        <span>
                            XP earned
                        </span>

                        <strong>
                            2,450
                        </strong>

                        <small>
                            +320 XP
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
                            4
                        </strong>

                        <span>
                            / 5 workouts
                        </span>

                    </div>

                    <div className="progress-goal-track">

                        <div
                            className="progress-goal-bar"
                            style={{
                                width: "80%",
                            }}
                        />

                    </div>

                    <p>
                        One more workout to reach
                        your weekly goal.
                    </p>

                </article>

                <article className="progress-performance-card">

                    <div className="progress-performance-card__header">

                        <div>
                            <span>
                                PERFORMANCE
                            </span>

                            <h3>
                                Compared to last month
                            </h3>
                        </div>

                        <TrendingUp size={19} />

                    </div>

                    <div className="progress-comparison">

                        <div>
                            <ArrowUp
                                size={17}
                            />

                            <strong>
                                18.4%
                            </strong>

                            <span>
                                Overall improvement
                            </span>
                        </div>

                        <div>
                            <ArrowDown
                                size={17}
                            />

                            <strong>
                                6.2%
                            </strong>

                            <span>
                                Rest day reduction
                            </span>
                        </div>

                    </div>

                </article>

            </div>

        </section>
    );
};

export default Progress;