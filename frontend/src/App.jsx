import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoutes from "./routes/protected_routes.jsx";
import ModeratorRoute from "./routes/moderator_route.jsx";
import Dashboard from './pages/dashboard.jsx'
import LearnPage from './pages/learn_page.jsx'
import { ROUTES } from "./lib/learn/routing.js";
import GameInfo from "./pages/learn/GameInfo.jsx";
import GameMC from "./pages/learn/GameMC.jsx";
import GameFITB1 from "./pages/learn/GameFITB1.jsx";
import GameFITB2 from "./pages/learn/GameFITB2.jsx";
import GameFC from "./pages/learn/GameFC.jsx";
import GameCorrect from "./pages/learn/GameCorrect.jsx";
import GameAnswerMC from "./pages/learn/GameAnswerMC.jsx";
import GameAnswerFITB from "./pages/learn/GameAnswerFITB.jsx";
import GameAnswerFC from "./pages/learn/GameAnswerFC.jsx";
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
                    <Route path="/learn" element={<Navigate to={ROUTES.GAME_INFO} replace />} />
                    <Route path={ROUTES.GAME_INFO} element={<GameInfo />} />
                    <Route path={ROUTES.GAME_MC} element={<GameMC />} />
                    <Route path={ROUTES.GAME_FITB1} element={<GameFITB1 />} />
                    <Route path={ROUTES.GAME_FITB2} element={<GameFITB2 />} />
                    <Route path={ROUTES.GAME_FC} element={<GameFC />} />
                    <Route path={ROUTES.GAME_CORRECT} element={<GameCorrect />} />
                    <Route path={ROUTES.ANSWER_MC} element={<GameAnswerMC />} />
                    <Route path={ROUTES.ANSWER_FITB} element={<GameAnswerFITB />} />
                    <Route path={ROUTES.ANSWER_FC} element={<GameAnswerFC />} />
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
