import React, { useState } from "react";

function PasswordInput() {
    const [password, setPassword] = useState("");

    const handleChange = (event) => {
        setPassword(event.target.value);
    };

    return (
        <div style={{ textAlign: "center" }}>
        <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handleChange}
           
        />
        </div>
    );
};

export default PasswordInput;