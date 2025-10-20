import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import SignIn from "../components/signIn.jsx"
import React from "react";
import {useState} from 'react'
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase/firebaseConfig.js"

function SignInPage ({ setUser }){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleDebugLogin = () => {
        const fakeUser = {
            name: "Debug",
            email: "debug@yahoo.com",
        };
        setUser(fakeUser);
    }

    const handleSubmit = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            setUser(user);
            console.log("User Created:", user);
        } catch(error) {
            console.error("Signup Error:", error.code, error.message);
        }
    };

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
                        <EmailInput value={email} onChange={setEmail}/>
                        <PasswordInput value={password} onChange={setPassword}/>
                        <SignIn onClick={handleSubmit}/>
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
export default SignInPage;