import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import LogIn from "../components/login.jsx"
import React from "react";
import {useState} from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'

function LogInPage(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            axios.post("http://localhost:5050/api/auth/login", {
                email: email,
                password: password
            })
            .then((response) => {
                const data = response.data.data;

                localStorage.setItem("token", data.token);
                localStorage.setItem("userID", data.userID);

                navigate("/dashboard");
            })
            .catch(function (error) {
                window.alert("Error: " + error.response?.data?.message);
            });

        } catch(error) {
            console.error("Signup Error:", error.code, error.message);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            navigate("/dashboard");
            console.log("User signed in with Google: ", user);
        } catch(error) {
            console.error("Log in with Google error: ", error.code, error.message);
        }
    };

    return (
        <>
            <div className="welcomePage">
                <div className="main-box">
                    <h1 className="sign-in-logo">Welcome Back</h1>
                    <hr />
                    <div className="loginButtons">
                        <EmailInput value={email} onChange={setEmail}/>
                        <PasswordInput value={password} onChange={setPassword}/>
                        <LogIn onClick={handleSubmit}/>
                        <p style={{color:"black", margin:"0px"}}>
                            Dont have an account?{" "}
                            <Link to="/signup">Create one</Link>
                        </p>
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
                    </div>
                </div>

            </div>
        </>
    )
}
export default LogInPage;