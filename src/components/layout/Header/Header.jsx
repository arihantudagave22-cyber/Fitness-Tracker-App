import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext.js";
import "./Header.css";

const Header = () => {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const roleLabel = {
        user: "Fitness Member",
        admin: "Administrator",
        superadmin: "Superadmin",
    }[user?.role] ?? "Fitness Member";

    return (
        <header className="header">
            <div className="header__right">
                <div className="header__profile">
                    <div className="header__avatar">
                        {user?.name?.slice(0, 1).toUpperCase() ?? "U"}
                    </div>
                    <div className="header__user">
                        <strong>{user?.name ?? "Member"}</strong>
                        <span>{roleLabel}</span>
                    </div>
                </div>

                <button
                    type="button"
                    className="header__icon-button"
                    aria-label="Sign out"
                    title="Sign out"
                    onClick={() => {
                        signOut();
                        navigate("/login", { replace: true });
                    }}
                >
                    <LogOut size={18} />
                </button>
            </div>
        </header>
    );
};

export default Header;