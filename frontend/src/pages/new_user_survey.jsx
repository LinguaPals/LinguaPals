import React from "react"
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function NewUserSurvey( {user} ) {
    const [language, setLanguage] = useState(null);
    const [proficiency, setProficiency] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = () => {
        //log info here
        
        //move to dashboard
        navigate("/dashboard");
        console.log("moving to dashboard");
    }
    return (
        <>
            <div className="survey-page">
                <h1 style={{color: "rgb(166,192,94"}}>Tell us about yourself</h1>
                <form className="survey-form">
                    <label for='name'>Create an username</label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        placeholder='ex) penjaminpals'
                        required
                        className="survey-field"
                       
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
                     onChange={(e) => setProficiency(e.target.value)} 
                     style={{margin: "8px 0", padding: "6px" }}
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
                     <button onClick={handleSubmit} type="submit">Submit</button>
                </form>
            </div>
        </>
    )
}

export default NewUserSurvey;