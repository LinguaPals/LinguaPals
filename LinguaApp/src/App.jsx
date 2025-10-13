import { useState } from 'react'
import './App.css'
import Dashboard from './pages/dashboard.jsx'
import WelcomePage from './pages/welcome_page.jsx';


function App() {
    const [user, setUser] = useState(null); 
    return (
        <section>
            {user ? (
            <Dashboard user={user} setUser={setUser}/>
            ) : (
            <WelcomePage setUser={setUser}/>
            )}
            {/* <Dashboard /> */}
        </section>
    )
}

export default App
