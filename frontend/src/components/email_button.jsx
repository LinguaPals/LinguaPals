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
            placeholder="Email"
            value={email}
            onChange={handleChange}
        />
        
        
        </div>
    );
};

export default EmailInput;