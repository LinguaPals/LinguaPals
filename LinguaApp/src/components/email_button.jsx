import React, { useState } from "react";

function EmailInput() {
    const [email, setEmail] = useState("");

    const handleChange = (event) => {
        setEmail(event.target.value);
    };

    return (
        <div style={{ textAlign: "center" }}>
        <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={handleChange}
            style={{ padding: "3px", fontSize: "13px", width: "350px"}}
        />
        
        
        </div>
    );
};

export default EmailInput;