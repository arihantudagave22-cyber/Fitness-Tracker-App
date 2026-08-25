import { Bell, Search } from "lucide-react";
import "./Header.css"

const Header = () => {
    return (
        <header className="header">
            <div className="header__left">
                <div className="header__search">
                    <Search size={18} />

                    <input
                        type="search"
                        placeholder="Search..."
                        aria-label="Search"
                    />

                    <span className="header__shortcut">
                        
                    </span>
                </div>
            </div>

            <div className="header__right">
                <button
                    type="button"
                    className="header__icon-button"
                    aria-label="Notifications"
                >
                    <Bell size={19} />
                    <span className="header__notification-dot" />
                </button>

                <div className="header__divider" />

                <button
                    type="button"
                    className="header__profile"
                >
                    <div className="header__avatar">
                        A
                    </div>
                    <div className="header__user">
                        <strong>Alex</strong>
                        <span>Fitness Member</span>
                    </div>
                </button>
            </div>
        </header>
    );
};
export default Header;