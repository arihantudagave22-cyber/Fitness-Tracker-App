import {
    ChartNoAxesCombined,
    Dumbbell,
    Home,
    Trophy,
} from "lucide-react";

import "./MobileNav.css";

const navigationItems = [
    {
        label: "Home",
        icon: Home,
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
];

const MobileNav = () => {
    return (
        <nav className="mobile-nav">
            {navigationItems.map((item) => {
                const Icon = item.icon;

                return (
                    <a
                        key={item.path}
                        href={item.path}
                        className={`mobile-nav__item ${
                            item.path === "/"
                                ? "mobile-nav__item--active"
                                : ""
                        }`}
                    >
                        <Icon size={20} strokeWidth={2} />
                        <span>{item.label}</span>
                    </a>
                );
            })}
        </nav>
    );
};

export default MobileNav;