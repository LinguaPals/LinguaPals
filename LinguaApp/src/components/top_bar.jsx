import CompanyLogo from "/src/images/temporary_logo.jpeg"
import ProfileImg from "/src/images/profile.png"
import React, { useState } from "react";
const TopBar = ({ user, setUser }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    const handleOptionClick = (option) => {
        // where dropdown click logic goes
        setIsOpen(false);
        if (option === 'Log Out') {
            setUser(null);
        }
        console.log('Selected option:', option);
        
    };


    return (
        <div className="top-bar">
            <img src={CompanyLogo} className="top-bar-img" />
            <p>LinguaPals</p>
            <div className="profile-dropdown">
                <button 
                onClick={ toggleDropdown }
                style={{
                    background: "none",
                    border: 'none',
                    padding: 0
                }}>
                    <img src={ ProfileImg } alt='Profile' className="top-bar-img" />
                </button>
                {isOpen && (
                    <ul className="dropdown-menu">
                        <li onClick={() => handleOptionClick('Log Out')}> Log Out </li>
                        <li onClick={() => handleOptionClick('Account Info')}>Account Info</li>
                        <li onClick={() => handleOptionClick('Settings')}>Settings</li>
                    </ul>
                )}
            </div>
        </div>
    )
}

export default TopBar;