import {
    Flame,
    Dumbbell,
    Scale,
    Target,
    Timer,
} from "lucide-react";

import Card from "../../components/common/Card/Card";
import StatCard from "../../components/common/StatCard/StatCard";
import ProgressBar from "../../components/common/ProgressBar/ProgressBar";
import Button from "../../components/common/Button/Button";

import "./Dashboard.css";

const Dashboard = () => {
    return (
        <div className="dashboard">
            <div className="page-container">

                {/* =========================================
                    PAGE HEADER
                ========================================= */}

                <div className="page-header">
                    <div>
                        <span className="dashboard__eyebrow">
                            YOUR FITNESS JOURNEY
                        </span>

                        <h1 className="page-title">
                            Good morning, Alex 👋
                        </h1>

                        <p className="page-subtitle">
                            Stay consistent and keep moving toward
                            your goals.
                        </p>
                    </div>
                </div>

                {/* =========================================
                    WELCOME CARD
                ========================================= */}

                <section className="dashboard__welcome">
                    <div>
                        <span className="dashboard__eyebrow">
                            TODAY'S FOCUS
                        </span>

                        <h2>
                            Make today count.
                        </h2>

                        <p>
                            Complete your daily activities and
                            keep your fitness streak alive.
                        </p>
                    </div>

                    <div className="dashboard__progress">
                        <span>
                            Daily Progress
                        </span>

                        <strong>
                            0%
                        </strong>
                    </div>
                </section>

                {/* =========================================
                    STATISTICS
                ========================================= */}

                <section className="dashboard__section">
                    <div className="dashboard__section-header">
                        <div>
                            <h2 className="dashboard__section-title">
                                Your Overview
                            </h2>

                            <p className="dashboard__section-subtitle">
                                Your latest fitness statistics.
                            </p>
                        </div>
                    </div>

                    <div className="dashboard__stats">
                        <StatCard
                            label="Current Weight"
                            value="72"
                            unit="kg"
                            trend="-1.2 kg"
                            trendLabel="Since last month"
                            icon={<Scale size={19} />}
                        />

                        <StatCard
                            label="Workout Time"
                            value="45"
                            unit="min"
                            trend="+12%"
                            trendLabel="This week"
                            variant="secondary"
                            icon={<Timer size={19} />}
                        />

                        <StatCard
                            label="Calories"
                            value="1,240"
                            unit="kcal"
                            trend="+8%"
                            trendLabel="Today's activity"
                            variant="warning"
                            icon={<Flame size={19} />}
                        />

                        <StatCard
                            label="Workout Streak"
                            value="7"
                            unit="days"
                            trend="Active"
                            trendLabel="Keep it going"
                            variant="success"
                            icon={<Dumbbell size={19} />}
                        />
                    </div>
                </section>

                {/* =========================================
                    GOAL + CHALLENGE
                ========================================= */}

                <section className="dashboard__grid">

                    <Card>
                        <div className="dashboard__card-header">
                            <div>
                                <h2 className="dashboard__card-title">
                                    Today's Goal
                                </h2>

                                <p className="dashboard__card-subtitle">
                                    Complete your planned activity.
                                </p>
                            </div>

                            <div className="dashboard__card-icon">
                                <Target size={19} />
                            </div>
                        </div>

                        <div className="dashboard__goal">
                            <div className="dashboard__goal-value">
                                <strong>0</strong>
                                <span>/ 5 activities</span>
                            </div>

                            <ProgressBar
                                value={0}
                                max={5}
                                showValue
                            />
                        </div>

                        <Button
                            fullWidth
                            className="dashboard__goal-button"
                        >
                            Start Activity
                        </Button>
                    </Card>

                    <Card>
                        <div className="dashboard__card-header">
                            <div>
                                <h2 className="dashboard__card-title">
                                    Daily Challenge
                                </h2>

                                <p className="dashboard__card-subtitle">
                                    Push yourself a little further.
                                </p>
                            </div>

                            <div className="dashboard__challenge-badge">
                                NEW
                            </div>
                        </div>

                        <div className="dashboard__challenge">
                            <div className="dashboard__challenge-icon">
                                🔥
                            </div>

                            <div>
                                <h3>
                                    20 Minute Movement
                                </h3>

                                <p>
                                    Complete 20 minutes of physical
                                    activity today.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            fullWidth
                        >
                            View Challenge
                        </Button>
                    </Card>

                </section>
            </div>
        </div>
    );
};

export default Dashboard;