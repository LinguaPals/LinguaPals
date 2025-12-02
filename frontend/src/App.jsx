import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from "./routes/protected_routes.jsx";
import ModeratorRoute from "./routes/moderator_route.jsx";
import Dashboard from './pages/dashboard.jsx'
import SignInPage from './pages/sign_up_page.jsx';
import LogInPage from './pages/login_page.jsx';
import NewUserSurvey from './pages/new_user_survey.jsx'
import LandingPage from './pages/landing_page.jsx'
import AdminPanel from './pages/admin_panel.jsx'


function App() {
    const [user, setUser] = useState(null);

    return (
       <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignInPage />} />
                <Route element={<ProtectedRoutes/>}>
                    <Route path="/dashboard" element={<Dashboard user={user} setUser={setUser} />} />
                    <Route path="/survey" element={<NewUserSurvey/>} /> 
                </Route>
                <Route element={<ModeratorRoute/>}>
                    <Route path="/admin" element={<AdminPanel />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
       </Router>
    )
}

export default App
