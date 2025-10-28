import React from 'react'

function SignIn( { onClick }) {
    
    return (
        <div className="sign-in">
            <button onClick={ onClick }>
                Sign Up
            </button>
        </div>
    );
}

export default SignIn;