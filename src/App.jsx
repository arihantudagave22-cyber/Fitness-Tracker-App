import {
    Navigate,
    Outlet,
    Route,
    Routes,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.js";

import AppLayout from "./components/layout/AppLayout/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Challenges from "./pages/Challenges/Challenges";
import Workouts from "./pages/Workouts/Workouts";
import Progress from "./pages/Progress/Progress";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";
import Measurements from "./pages/Measurements/Measurements";
import AdminUsers from "./pages/Admin/AdminUsers";

function ProtectedApp() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="app-loading" role="status">Loading your fitness data...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <AppLayout />;
}

function RequireRole({ allowedRoles }) {
    const { user } = useAuth();
    return allowedRoles.includes(user?.role) ? <Outlet /> : <Navigate to="/" replace />;
}

function AuthRoute({ children }) {
    const { user, isLoading } = useAuth();
    if (isLoading) {
        return <div className="app-loading" role="status">Loading your account...</div>;
    }
    return user ? <Navigate to="/" replace /> : children;
}


const App = () => {
    return (
        <Routes>

            {/* Authentication */}

            <Route
                path="/login"
                element={<AuthRoute><Login /></AuthRoute>}
            />

            <Route
                path="/register"
                element={<AuthRoute><Register /></AuthRoute>}
            />

        {/* Application */}      
            <Route element={<ProtectedApp />}>
                <Route
                    path="/"
                    element={<Dashboard />}
                />
                <Route
                  path="/challenges"
                  element={<Challenges />}
                />
                <Route
                    path="/workouts"
                    element={<Workouts />} />
                <Route
                    path="/progress"
                    element={<Progress />}
                />
                <Route
                    path="/measurements"
                    element={<Measurements />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="/settings"
                    element={<Settings />}
                />
                <Route
                    path="/admin"
                    element={<RequireRole allowedRoles={["admin", "superadmin"]} />}
                >
                    <Route index element={<AdminUsers />} />
                </Route>
        </Route>
        
        {/* Unknown route */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>
    );
};

export default App;