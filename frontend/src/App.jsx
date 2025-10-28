import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx'
import SignInPage from './pages/sign_in_page.jsx';
import LogInPage from './pages/login_page.jsx';
import NewUserSurvey from './pages/new_user_survey.jsx'
import LandingPage from './pages/landing_page.jsx'


function App() {
    return (
       <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LogInPage />} />
                <Route path="/signup" element={<SignInPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/survey" element={<NewUserSurvey />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
       </Router>
    )
}

export default App
