import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import LogIn from "../components/login.jsx"
import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios'

function LogInPage(){
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
                navigate(isModerator ? "/admin" : "/dashboard", { replace: true });
            }
        }
    }, [location, navigate]);

    const handleSubmit = async () => {
        try {
            const response = await axios.post("http://localhost:5050/api/auth/login", {
                email: email,
                password: password
            });
            
            const data = response.data?.data || response.data;
            localStorage.setItem("token", data.token);
            localStorage.setItem("userID", data.userID);
            localStorage.setItem("isModerator", data.isModerator ? "true" : "false");

            // Wait a tick to ensure localStorage is updated before navigation
            setTimeout(() => {
                navigate(data.isModerator ? "/admin" : "/dashboard", { replace: true });
            }, 0);
        } catch (error) {
            window.alert("Error: " + error?.response?.data?.message);
        }
    };

    const signInWithGoogle = () => {
        window.location.href = "http://localhost:5050/api/auth/google";
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