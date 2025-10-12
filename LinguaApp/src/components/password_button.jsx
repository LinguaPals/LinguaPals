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
            placeholder="Enter your password"
            value={password}
            onChange={handleChange}
            style={{ padding: "3px", fontSize: "13px", width: "350px"}}
        />
        </div>
    );
};

export default PasswordInput;