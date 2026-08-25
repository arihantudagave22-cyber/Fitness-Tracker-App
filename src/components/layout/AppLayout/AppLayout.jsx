import { Outlet } from "react-router-dom";

import Sidebar from "../Sidebar/Sidebar";
import Header from "../Header/Header";
import MobileNav from "../MobileNav/MobileNav";

import "./AppLayout.css";

const AppLayout = () => {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="app-layout__main">
                <Header />

                <main className="app-layout__content">
                    <Outlet />
                </main>
            </div>

            <MobileNav />
        </div>
    );
};

export default AppLayout;