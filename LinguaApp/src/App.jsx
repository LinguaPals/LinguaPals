import { useState } from 'react'
import './App.css'
import Dashboard from './pages/dashboard.jsx'
import WelcomePage from './pages/welcome_page.jsx';
import LandingPage from './pages/landing_page.jsx';

function App() {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);

    return (
        <section>
            {user ? (
                <Dashboard user={user} setUser={setUser}/>
            ) : showLogin ? (
                <WelcomePage setUser={setUser}/>
            ) : (
                <LandingPage setShowLogin={setShowLogin}/>
            )}
        </section>
    )
}

export default App
