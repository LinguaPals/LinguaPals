import React from "react"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function SettingsModal({ onClose }) {
    const [language, setLanguage] = useState("");
    const [proficiency, setProficiency] = useState("");
    const [username, setUsername] = useState("");
    const [canMatch, setCanMatch] = useState(false);
    const [canEmail, setCanEmail] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const userID = localStorage.getItem("userID");
        console.log(userID);

        axios.put(`http://localhost:5050/api/users/${userID}`, {
            language: language,
            proficiency: proficiency,
            canMatch: canMatch,
            canEmail: canEmail,
        }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then((response) => {
            console.log("Updated User:", response.data);
            localStorage.setItem("username", username);
            onClose?.();
            navigate("/dashboard");
        })
        .catch((error) => {
    console.error("Full error:", error);

    const msg =
        error?.response?.data?.message ||   // backend error message
        error?.message ||                   // axios/network message
        "Unknown error occurred";

    alert(msg);
});
}

    return (
        <div className="recorder-modal-overlay">
            <form className="survey-form" onSubmit={handleSubmit}>
                <h2 style={{ color: "rgb(166,192,94)" }}>Settings</h2>
                <label htmlFor="language">Which Language are you learning?</label>
                <select 
                    id="language" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)} 
                    style={{margin: "8px 0", padding: "6px" }}
                    className="survey-field"
                    >
                    <option value="">-- Select a language --</option>
                    <option value="spanish">-- Spanish --</option>
                    <option value="french">-- French --</option>
                    <option value="japanese">-- Japanese --</option>
                    </select>
                <label htmlFor="proficiency-level">What proficiency level are you?</label>
                <select 
                    id="proficiency-level" 
                    value={proficiency}
                    style={{margin: "8px 0", padding: "6px" }}
                    onChange={(e) => setProficiency(e.target.value)} 
                    className="survey-field"
                    >
                    <option value="">-- Select a level --</option>
                    <option value="brand-new">-- Brand New --</option>
                    <option value="a1">-- A1: Can use basic phrases  --</option>
                    <option value="a2">-- A2: Can use and understand simple sentences --</option>
                    <option value="b1">-- B1: Can describe experiences and events, in multiple tenses --</option>
                    <option value="b2">-- B2: Can interact with native speakers without exessive strain --</option>
                    <option value="c1">-- C1: Can express ideas fluently and spontaneously --</option>
                    <option value="c2">-- C2: Near pefect fluency --</option>
                </select>
                
                <div style={{margin: "4px 0"}}>
                <input 
                    type="checkbox"
                    checked={canMatch}
                    style={{margin: "10px"}}
                    onChange={(e) => setCanMatch(e.target.checked)}
                />
                <label htmlFor="canMatch">I am willing to be matched with other users</label>
                </div>
                <div style={{margin: "4px 0"}}>
                    <input 
                        type="checkbox"
                        checked={canEmail}
                        style={{margin: "10px"}}
                        onChange={(e) => setCanEmail(e.target.checked)}
                    />
                    <label htmlFor="canEmail">I am to recieve email notifications</label>
                    </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                    <button type="submit" style={{ margin: "4px" }}>Submit</button>
                    <button type="button" onClick={onClose} style={{ margin: "4px" }}>Cancel</button>
                </div>
            </form>
        </div>
    )
}