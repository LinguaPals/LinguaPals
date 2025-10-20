import React from "react";

function PasswordInput({ value, onChange }) {

    return (
        <div style={{ textAlign: "center" }}>
        <input
            type="password"
            placeholder="Password"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        </div>
    );
};

export default PasswordInput;