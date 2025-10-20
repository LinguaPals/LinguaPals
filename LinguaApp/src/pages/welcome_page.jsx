import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import SignIn from "../components/signIn.jsx"
import React from "react";
function WelcomePage ({ setUser }){
    /* Once we get mongo set up put in the sign in with google feature here, as well as user authentication */
    /* Then change the user var so the App() switches states to Dashboard */
    const handleDebugLogin = () => {
        const fakeUser = {
            name: "Debug",
            email: "debug@yahoo.com",
        };
        setUser(fakeUser);
    }

    const signInWithGoogle = async () => {
        //this is temporary and does nothing
        const res = await fetch()
    };

    return (
        <>
            <div className="welcome-split">
                <div className="promo-panel">
                    <div className="promo-content">
                        <h1>Welcome to LinguaPals</h1>
                        <p>Find language partners, practice speaking, and grow together.</p>
                    </div>
                </div>

                <div className="login-panel">
                    <div className="main-box small">
                        <h1 className="sign-in-logo">LinguaPals</h1>
                        <hr />
                        <div className="loginButtons small">
                            <EmailInput />
                            <PasswordInput />
                            <SignIn />
                            <div className="or-separator">
                                <hr />
                                <span>or</span>
                                <hr />
                            </div>
                            <button onClick={signInWithGoogle} className="google-button">
                                <img src={ GoogleIcon } alt="Sign in with Google" className="google-icon" />
                            </button>
                            <button onClick={handleDebugLogin} className="debug-button">Go to dashboard</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default WelcomePage;