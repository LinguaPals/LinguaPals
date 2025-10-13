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
                <div className="main-box">
                    <h1 className="sign-in-logo">LinguaPals</h1>
                    <hr />
                    <div className="loginButtons">
                        <EmailInput />
                        <PasswordInput />
                        <SignIn />
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            width: "300px",
                            color: "gray"
                        }}>
                            <hr style={{ flex: 1, border: "none", borderTop: "1px solid lightgray"}}/>
                            <span style={{ margin: "0 10px" }}>or</span>
                            <hr style={{ flex: 1, border: "none", borderTop: "1px solid lightgray"}}/>
                        </div>
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

            </div>
        </>
    )
}
export default WelcomePage;