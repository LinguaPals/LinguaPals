import React from 'react'
import { useState } from 'react';
import { postMessage } from '../services/messageService';

const handleSendMessage = async (message) => {
    
    postMessage(message)
        .then(response => {
            console.log("Message posted successfully: ", response);
        })
        .catch(error => {
            console.error("Error posting message: ", error);
        });
}

function ChatBox() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    return (
        <>
        {isOpen ? (
            <div className = "chat-box">
            <input 
                type="text" 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                placeholder="Type your message..."
            />
            <button onClick={() => {
                // Handle sending message logic here
                console.log("Message sent: ", message);
                handleSendMessage(message);
                setMessage(''); // Clear input after sending
            }}>
                Send
            </button>
            <button onClick={() => setIsOpen(false)}>
                X
            </button>
            
            
        </div>
        ) : (
            <button id="chat-button" onClick={() => setIsOpen(true)}>
                Chat
            </button>
        )}
        </>
    );
}

export default ChatBox;