import { useState } from 'react'
import './App.css'
import Dashboard from './pages/dashboard.jsx'
import SignInPage from './pages/sign_in_page.jsx';


function App() {
    const [user, setUser] = useState(null); 
    return (
        <section>
            {user ? (
            <Dashboard user={user} setUser={setUser}/>
            ) : (
            <SignInPage setUser={setUser}/>
            )}
            {/* <Dashboard /> */}
        </section>
    )
}

export default App
