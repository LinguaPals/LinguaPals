import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Dashboard from './pages/dashboard.jsx'
import WelcomePage from './pages/welcome_page.jsx';


function App() {
    const [user, setUser] = useState(null); 
    return (
        <section>
            {user ? (
            <Dashboard user={user} />
            ) : (
            <WelcomePage setUser={setUser}/>
            )}
        </section>

    )
}

export default App
