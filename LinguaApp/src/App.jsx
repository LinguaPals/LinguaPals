import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './pages/dashboard.jsx'
import WelcomePage from './pages/welcome_page.jsx';
function App() {
    const user = 0; /*this is where the google sign in auth state will be */
    return (
        <section>
            {user ? <Dashboard /> : <SignIn />}
        </section>

    )
}

export default App
