import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx'
import SignInPage from './pages/sign_in_page.jsx';
import LogInPage from './pages/login_page.jsx';
import NewUserSurvey from './pages/new_user_survey.jsx'


function App() {
    return (
       <Router>
            <Routes>
                <Route path="/" element={<LogInPage />} />
                <Route path="/signup" element={<SignInPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/survey" element={<NewUserSurvey />} />
            </Routes>
       </Router>
    )
}

export default App
