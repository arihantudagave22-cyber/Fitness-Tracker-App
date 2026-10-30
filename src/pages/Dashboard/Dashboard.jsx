import {
    Flame,
    Dumbbell,
    Scale,
    Target,
    Timer,
    Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import FitnessVisual3D from "../../components/brand/FitnessVisual3D";
import Card from "../../components/common/Card/Card";
import StatCard from "../../components/common/StatCard/StatCard";
import ProgressBar from "../../components/common/ProgressBar/ProgressBar";
import { useAuth } from "../../context/AuthContext.js";
import { apiRequest } from "../../lib/api.js";

import "./Dashboard.css";

function Dashboard() {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let isCurrent = true;
        apiRequest("/dashboard")
            .then((result) => {
                if (isCurrent) {
                    setDashboard(result.dashboard);
                }
            })
            .catch((requestError) => {
                if (isCurrent) {
                    setError(requestError.message);
                }
            });
        return () => {
            isCurrent = false;
        };
    }, []);

    if (error) {
        return <p className="app-error" role="alert">{error}</p>;
    }

    if (!dashboard) {
        return <p className="app-loading" role="status">Loading your dashboard...</p>;
    }

    const { totals, streak, weight, challenges, recentWorkouts } = dashboard;
    const weeklyProgress = Math.min(totals.weeklyWorkouts, 5);
    const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";
    const greeting = new Date().getHours() < 12
        ? "Good morning"
        : new Date().getHours() < 18
            ? "Good afternoon"
            : "Good evening";

    return (
        <div className="dashboard">
            <div className="page-container">
                <div className="page-header">
                    <div>
                        <span className="dashboard__eyebrow">YOUR FITNESS JOURNEY</span>
                        <h1 className="page-title">{greeting}, {firstName}!</h1>
                        <p className="page-subtitle">
                            Stay consistent and keep moving toward your goals.
                        </p>
                    </div>
                    <FitnessVisual3D icon={Dumbbell} variant="violet" />
                </div>

                <section className="dashboard__welcome">
                    <div>
                        <span className="dashboard__eyebrow">THIS WEEK'S FOCUS</span>
                        <h2>Make today count.</h2>
                        <p>Log your training and keep your fitness streak alive.</p>
                    </div>
                    <div className="dashboard__progress">
                        <span>Weekly workout goal</span>
                        <strong>{Math.round((weeklyProgress / 5) * 100)}%</strong>
                    </div>
                </section>

                <section className="dashboard__section">
                    <div className="dashboard__section-header">
                        <div>
                            <h2 className="dashboard__section-title">Your Overview</h2>
                            <p className="dashboard__section-subtitle">
                                Calculated from your saved activity.
                            </p>
                        </div>
                    </div>
                    <div className="dashboard__stats">
                        <StatCard
                            label="Current Weight"
                            value={weight ? Number(weight.value).toLocaleString() : "--"}
                            unit={weight?.unit ?? "kg"}
                            trend={weight ? "Latest entry" : "Add a measurement"}
                            trendLabel="Body weight"
                            icon={<Scale size={19} />}
                        />
                        <StatCard
                            label="Workout Time"
                            value={totals.durationMinutes.toLocaleString()}
                            unit="min"
                            trend={`${totals.weeklyWorkouts} this week`}
                            trendLabel="Total logged"
                            variant="secondary"
                            icon={<Timer size={19} />}
                        />
                        <StatCard
                            label="Calories"
                            value={totals.todayCalories.toLocaleString()}
                            unit="kcal"
                            trend={`${totals.calories.toLocaleString()} total`}
                            trendLabel="Today's activity"
                            variant="warning"
                            icon={<Flame size={19} />}
                        />
                        <StatCard
                            label="Workout Streak"
                            value={streak.toLocaleString()}
                            unit="days"
                            trend={streak ? "Active" : "Start today"}
                            trendLabel="Consecutive days"
                            variant="success"
                            icon={<Dumbbell size={19} />}
                        />
                    </div>
                </section>

                <section className="dashboard__grid">
                    <Card>
                        <div className="dashboard__card-header">
                            <div>
                                <h2 className="dashboard__card-title">Weekly Goal</h2>
                                <p className="dashboard__card-subtitle">
                                    Log five workouts this week.
                                </p>
                            </div>
                            <div className="dashboard__card-icon"><Target size={19} /></div>
                        </div>
                        <div className="dashboard__goal">
                            <div className="dashboard__goal-value">
                                <strong>{weeklyProgress}</strong><span>/ 5 workouts</span>
                            </div>
                            <ProgressBar value={weeklyProgress} max={5} showValue />
                        </div>
                        <Link className="button button--primary button--full dashboard__goal-button" to="/workouts">
                            Start Workout
                        </Link>
                    </Card>

                    <Card>
                        <div className="dashboard__card-header">
                            <div>
                                <h2 className="dashboard__card-title">Challenges</h2>
                                <p className="dashboard__card-subtitle">
                                    Keep building consistency.
                                </p>
                            </div>
                            <div className="dashboard__challenge-badge">{challenges.active} ACTIVE</div>
                        </div>
                        <div className="dashboard__challenge">
                            <div className="dashboard__challenge-icon"><Trophy size={22} /></div>
                            <div>
                                <h3>{challenges.completed} completed</h3>
                                <p>{challenges.active} challenges ready for you.</p>
                            </div>
                        </div>
                        <Link className="button button--outline button--full" to="/challenges">
                            View Challenges
                        </Link>
                    </Card>
                </section>

                <section className="dashboard__section">
                    <div className="dashboard__section-header">
                        <div>
                            <h2 className="dashboard__section-title">Recent Workouts</h2>
                            <p className="dashboard__section-subtitle">
                                Your latest saved sessions.
                            </p>
                        </div>
                        <Link to="/workouts">View all</Link>
                    </div>
                    {recentWorkouts.length ? (
                        <div className="dashboard__stats">
                            {recentWorkouts.slice(0, 4).map((workout) => (
                                <Card key={workout.id}>
                                    <strong>{workout.title}</strong>
                                    <p>{workout.durationMinutes} min · {workout.calories} kcal</p>
                                    <small>{new Date(workout.createdAt).toLocaleDateString()}</small>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <p>No workouts logged yet.</p>
                            <Link className="button button--primary" to="/workouts">Log your first workout</Link>
                        </Card>
                    )}
                </section>
            </div>
        </div>
    );
}

export default Dashboard;
