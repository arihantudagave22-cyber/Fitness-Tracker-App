import {
    LayoutDashboard,
    Trophy,
    Dumbbell,
    ChartNoAxesCombined,
    User,
    Ruler,
    Settings,
    Shield,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";

import "./MobileNav.css";

const items = [
    {
        id: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
    },
    {
        id: "/challenges",
        label: "Challenges",
        icon: Trophy,
    },
    {
        id: "/workouts",
        label: "Workouts",
        icon: Dumbbell,
    },
    {
        id: "/progress",
        label: "Progress",
        icon: ChartNoAxesCombined,
    },
    {
        id: "/measurements",
        label: "Measure",
        icon: Ruler,
    },
    {
        id: "/profile",
        label: "Profile",
        icon: User,
    },
    {
        id: "/settings",
        label: "Settings",
        icon: Settings,
    },
    {
        id: "/admin",
        label: "Admin",
        icon: Shield,
        adminOnly: true,
    },
];

export default function MobileNav() {
    const { user } = useAuth();
    return (
        <nav className="mobile-nav">
            {items.filter((item) =>
                !item.adminOnly || ["admin", "superadmin"].includes(user?.role)
            ).map((item) => {
                const Icon = item.icon;

                return (
                    <NavLink
                        key={item.id}
                        to={item.id}
                        end={item.id === "/"}
                        className={({ isActive: routeIsActive }) =>
                            `mobile-nav__item ${routeIsActive ? "mobile-nav__item--active" : ""}`
                        }
                    >
                        <Icon size={22} />

                        <span>{item.label}</span>
                    </NavLink>
                );
            })}
        </nav>
    );
}