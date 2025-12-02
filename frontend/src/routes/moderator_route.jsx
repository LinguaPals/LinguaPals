import { Navigate, Outlet } from 'react-router-dom';

function ModeratorRoute() {
    const token = localStorage.getItem("token");
    const isModerator = localStorage.getItem("isModerator") === "true";

    if (!token) {
        console.log("ModeratorRoute: No token, redirecting to login");
        return <Navigate to="/login" replace />;
    }

    if (!isModerator) {
        console.log("ModeratorRoute: User not moderator, redirecting to dashboard. isModerator=", localStorage.getItem("isModerator"));
        return <Navigate to="/dashboard" replace />;
    }

    console.log("ModeratorRoute: Access granted to admin panel");
    return <Outlet />;
}

export default ModeratorRoute;
