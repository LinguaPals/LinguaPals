import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import SignIn from "../components/signIn.jsx"
import React from "react";
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios'

function SignInPage (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const userID = params.get("userID");
        const isNew = params.get("isNew");
        const isModerator = params.get("isModerator") === "true";

        if (token) {
            localStorage.setItem("token", token);
            localStorage.setItem("userID", userID);
            localStorage.setItem("isModerator", isModerator ? "true" : "false");
            if (isNew === "true") {
                navigate("/survey", { replace: true });
            } else {
                setTimeout(() => {
                    navigate(isModerator ? "/admin" : "/dashboard", { replace: true });
                }, 0);
            }
        }
    }, [location, navigate]);

    const handleSubmit = () => {
        try {
            axios.post("http://localhost:5050/api/auth/signup", {
                email: email,
                password: password
            })
            .then((response) => {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("userID", response.data.data.userID);
                localStorage.setItem("isModerator", response.data.data.isModerator ? "true" : "false");
                console.log("User signed up");
                navigate("/survey");
            })
            .catch(function (error) {
                window.alert("Error: " + error.response?.data?.message);
            });

        } catch(error) {
            console.error("Error: " + error);
        }
    };

    const signInWithGoogle = () => {
        window.location.href = "http://localhost:5050/api/auth/google";
    };


    return (
        <>
            <div className="welcomePage">
                <div className="main-box">
                    <h1 className="sign-in-logo">Sign Up</h1>
                    <hr />
                    <div className="loginButtons">
                        <EmailInput value={email} onChange={setEmail}/>
                        <PasswordInput value={password} onChange={setPassword}/>
                        <SignIn onClick={handleSubmit}/>
                        <p style={{color:"black", margin:"0px"}}>
                            Already have an account?{" "}
                            <Link to='/login'>Sign in</Link>
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
                            id="google-icon"/>
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}
export default SignInPage;