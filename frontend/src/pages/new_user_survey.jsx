import React from "react"
import { useState } from 'react'

function NewUserSurvey( {user} ) {
    const [language, setLanguage] = useState(null);
    const [proficiency, setProficiency] = useState(null);
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
                        <option value="spanish">-- A1: Can use basic phrases  --</option>
                        <option value="french">-- A2: Can use and understand simple sentences --</option>
                        <option value="japanese">-- B2:  --</option>
                     </select>
                     <button type="submit">Submit</button>
                </form>
            </div>
        </>
    )
}

export default NewUserSurvey;