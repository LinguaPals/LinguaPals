import { Navigate, Outlet } from 'react-router-dom';

function ModeratorRoute() {
    const token = localStorage.getItem("token");
    const isModerator = localStorage.getItem("isModerator") === "true";

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (!isModerator) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}

export default ModeratorRoute;
