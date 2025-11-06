import { Navigate, Outlet } from 'react-router-dom'


function ProtectedRoutes() {
    const isLoggedIn = localStorage.getItem("token");

    if(!isLoggedIn) {
        console.log("User is not logged in: Cannot navigate to dashboard");
        return <Navigate to="/login" replace />;
    }
    console.log("User is logged in");
    return <Outlet />;
}

export default ProtectedRoutes;