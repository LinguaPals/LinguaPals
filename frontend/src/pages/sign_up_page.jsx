import GoogleIcon from "../images/SignInWithGoogle.png"
import EmailInput from "../components/email_button.jsx"
import PasswordInput from "../components/password_button.jsx"
import SignIn from "../components/signIn.jsx"
import React from "react";
import {useState} from 'react'
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios'

function SignInPage (){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = () => {
        try {
            axios.post("http://localhost:5050/api/auth/signup", {
                email: email,
                password: password
            })
            .then((response) => {
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("userID", response.data.data.userID);

                navigate("/survey");
            })
            .catch(function (error) {
                window.alert("Error: " + error.response?.data?.message);
            });

        } catch(error) {
            console.error("Error: " + error);
        }
    };

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;

            navigate("/dashboard");
            console.log("User Created with Google: ", user);
        } catch(error) {
            console.error("Sign in with Google error: ", error.code, error.message);
        }
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