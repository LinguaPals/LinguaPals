import React from "react";

function EmailInput({ value, onChange }) {

    return (
        <div style={{ textAlign: "center" }}>
        <input
            type="email"
            placeholder="Email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
        
        
        </div>
    );
};

export default EmailInput;