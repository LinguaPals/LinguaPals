import React from 'react'

function LogIn( { onClick }) {
    
    return (
        <div className="sign-in">
            <button onClick={ onClick }>
                Log In
            </button>
        </div>
    );
}

export default LogIn;