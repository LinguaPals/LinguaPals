import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/dashboard.jsx'
import SignInPage from './pages/sign_in_page.jsx';
import LogInPage from './pages/login_page.jsx';


function App() {
    return (
       <Router>
            <Routes>
                <Route path="/" element={<LogInPage />} />
                <Route path="/signup" element={<SignInPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
       </Router>
    )
}

export default App
