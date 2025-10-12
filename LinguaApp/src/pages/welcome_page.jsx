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
            <div className="welcomePage">
                <h1 className="logo">LinguaPals</h1>
                
                <div className="loginButtons">
                    <EmailInput />
                    <PasswordInput />
                    <SignIn />
                    <button onClick={signInWithGoogle}
                    style={{
                        background: "none",
                        border: "none",
                        padding: 0
                    }}>
                        <img src={ GoogleIcon }
                        alt="Sign in with Google"
                        className="google-icon"/>
                    </button>
                    {/*debugging button to switch to dash */}
                    <button
                        onClick={handleDebugLogin}>
                        Go to dashboard
                    </button>
                </div>

            </div>
            <p>The right way to learn a language</p>
        </>
    )
}
export default WelcomePage;