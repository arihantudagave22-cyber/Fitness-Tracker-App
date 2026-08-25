import {
    Navigate,
    Route,
    Routes,
} from "react-router-dom";

import AppLayout from "./components/layout/AppLayout/AppLayout";

import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Challenges from "./pages/Challenges/Challenges";
import Workouts from "./pages/Workouts/Workouts";
import Progress from "./pages/Progress/Progress";
import Profile from "./pages/Profile/Profile";
import Settings from "./pages/Settings/Settings";


const App = () => {
    return (
        <Routes>

            {/* Authentication */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

        {/* Application */}      
            <Route element={<AppLayout />}>
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
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="settings"
                    element={<Settings />}
                />
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