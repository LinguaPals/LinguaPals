import React from "react"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function NewUserSurvey() {
    const [language, setLanguage] = useState("");
    const [proficiency, setProficiency] = useState("");
    const [username, setUsername] = useState("");
    const [canMatch, setCanMatch] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const userID = localStorage.getItem("userID");
        console.log(userID);

        axios.put(`http://localhost:5050/api/users/${userID}`, {
            username: username,
            language: language,
            proficiency: proficiency,
            isNewGoogle: false,
            canMatch: canMatch
        })
        .then((response) => {
            console.log("Updated User:", response.data);
            localStorage.setItem("username", username);
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
        <>
            <div className="survey-page">
                <h1 style={{color: "rgb(166,192,94", marginTop: "15px"}}>Tell us about yourself</h1>
                <form className="survey-form">
                    <label for='name'>Create an username</label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        placeholder='ex) penjaminpals'
                        required
                        className="survey-field"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)} 
                       
                    />

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
                    <button onClick={handleSubmit} type="submit" style={{margin: "4px"}}>Submit</button>
                </form>
            </div>
        </>
    )
}

export default NewUserSurvey;