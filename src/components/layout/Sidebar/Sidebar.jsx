import {
    LayoutDashboard,
    Dumbbell,
    Trophy,
    ChartNoAxesCombined,
    User,
    Settings,
} from "lucide-react";

import { useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

const navigationItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
    },
    {
        label: "Challenges",
        icon: Trophy,
        path: "/challenges",
    },
    {
        label: "Workouts",
        icon: Dumbbell,
        path: "/workouts",
    },
    {
        label: "Progress",
        icon: ChartNoAxesCombined,
        path: "/progress",
    },
    {
        label: "Profile",
        icon: User,
        path: "/profile",
    },
    {
        label: "Settings",
        icon: Settings,
        path: "/settings",
    },
];

const COLLAPSED_WIDTH = 76;
const MAX_WIDTH = 380;
const DEFAULT_WIDTH = 260;

const Sidebar = () => {
    const [sidebarWidth, setSidebarWidth] =
        useState(DEFAULT_WIDTH);

    const [isCollapsed, setIsCollapsed] =
        useState(false);

    const isResizing = useRef(false);

    /* =========================================
       START RESIZE
    ========================================= */

    const handleMouseDown = () => {
        isResizing.current = true;

        document.body.classList.add(
            "sidebar-resizing"
        );

        document.addEventListener(
            "mousemove",
            handleMouseMove
        );

        document.addEventListener(
            "mouseup",
            handleMouseUp
        );
    };

    /* =========================================
       RESIZE SIDEBAR
    ========================================= */

    const handleMouseMove = (event) => {
        if (!isResizing.current) {
            return;
        }

        const newWidth = Math.min(
            Math.max(
                event.clientX,
                COLLAPSED_WIDTH
            ),
            MAX_WIDTH
        );

        /* Automatically collapse */
        if (newWidth <= 100) {
            setIsCollapsed(true);
            setSidebarWidth(
                COLLAPSED_WIDTH
            );

            document.documentElement.style.setProperty(
                "--sidebar-width",
                `${COLLAPSED_WIDTH}px`
            );

            return;
        }

        setIsCollapsed(false);
        setSidebarWidth(newWidth);

        document.documentElement.style.setProperty(
            "--sidebar-width",
            `${newWidth}px`
        );
    };

    /* =========================================
       STOP RESIZE
    ========================================= */

    const handleMouseUp = () => {
        isResizing.current = false;

        document.body.classList.remove(
            "sidebar-resizing"
        );

        document.removeEventListener(
            "mousemove",
            handleMouseMove
        );

        document.removeEventListener(
            "mouseup",
            handleMouseUp
        );
    };

    /* =========================================
       COLLAPSE / EXPAND
    ========================================= */

    const handleToggle = () => {
        const newCollapsedState =
            !isCollapsed;

        setIsCollapsed(
            newCollapsedState
        );

        const newWidth =
            newCollapsedState
                ? COLLAPSED_WIDTH
                : DEFAULT_WIDTH;

        setSidebarWidth(newWidth);

        document.documentElement.style.setProperty(
            "--sidebar-width",
            `${newWidth}px`
        );
    };

    return (
        <aside
            className={`sidebar ${
                isCollapsed
                    ? "sidebar--collapsed"
                    : ""
            }`}
            style={{
                width: `${sidebarWidth}px`,
            }}
        >
            {/* =========================================
                BRAND
            ========================================= */}

            <div className="sidebar-brand">

                <div className="sidebar-logo">
                    FT
                </div>

                <div className="sidebar_brand-content">

                    <h1>
                        FitTrack
                    </h1>

                    <span>
                        Fitness Tracker
                    </span>

                </div>

            </div>

            {/* =========================================
                NAVIGATION
            ========================================= */}

            <nav className="sidebar_navigation">

                <p className="sidebar-section-title">
                    MENU
                </p>

                <div className="sidebar_menu">

                    {navigationItems.map(
                        (item) => {
                            const Icon =
                                item.icon;

                            return (
                                <NavLink
                                    key={
                                        item.path
                                    }
                                    to={
                                        item.path
                                    }
                                    className={({
                                        isActive,
                                    }) =>
                                        `sidebar__item ${
                                            isActive
                                                ? "sidebar__item--active"
                                                : ""
                                        }`
                                    }
                                    title={
                                        isCollapsed
                                            ? item.label
                                            : undefined
                                    }
                                >

                                    <Icon
                                        size={19}
                                        strokeWidth={2}
                                    />

                                    <span>
                                        {
                                            item.label
                                        }
                                    </span>

                                </NavLink>
                            );
                        }
                    )}

                </div>

            </nav>

            {/* =========================================
                FOOTER
            ========================================= */}

            <div className="sidebar__footer">

                <div className="sidebar__streak">

                    <div className="sidebar__streak-icon">
                        🔥
                    </div>

                    <div className="sidebar__streak-content">

                        <strong>
                            7 Day Streak
                        </strong>

                        <span>
                            Keep going!
                        </span>

                    </div>

                </div>

            </div>

            {/* =========================================
                RESIZE HANDLE
            ========================================= */}

            <div
                className="sidebar__resize-handle"
                onMouseDown={
                    handleMouseDown
                }
            />

            {/* =========================================
                COLLAPSE BUTTON
            ========================================= */}

            <button
                type="button"
                className="sidebar__collapse-button"
                onClick={handleToggle}
                aria-label={
                    isCollapsed
                        ? "Expand sidebar"
                        : "Collapse sidebar"
                }
            >
                {isCollapsed
                    ? "›"
                    : "‹"}
            </button>

        </aside>
    );
};

export default Sidebar;