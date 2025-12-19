import React from 'react'
import { useState, useRef, useEffect } from 'react';
import { postMessage, getMatchMessages } from '../services/messageService';

const handleSendMessage = async (message) => {
    postMessage(message)
        .then(response => {
            console.log("Message posted successfully: ", response);
        })
        .catch(error => {
            console.error("Error posting message: ", error);
        });
}
function ChatBox({ username }) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [newMessageSent, setNewMessageSent] = useState(0);
    const [chatMessages, setChatMessages] = useState([]);
    const ref = useRef(null);

    useEffect(() => {
        const retrieveChatMessages = async () => {
            try {
                const messages = await getMatchMessages();
                if(!messages || messages.length === 0) {
                    setChatMessages([]);
                }
                else {
                    setChatMessages(messages);
                }
            } catch (error) {
                console.log("Error retrieving messages from backend: ", error);
            }
        }
        if(isOpen)
           retrieveChatMessages();
    }, [isOpen, newMessageSent]);

    const handleChange = (e) => {
        setMessage(e.target.value);

        const el = ref.current;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    };

    const sendMessage = () => {
        if(!message.trim()) return;
        handleSendMessage(message);
        setMessage('');
        setNewMessageSent(newMessageSent + 1);
        const el = ref.current;
        el.style.height = "auto";
    };

    return (
        <>
        {isOpen ? (
        <div className = "chat-box">
            <button id="close-chat" onClick={() => setIsOpen(false)}>
                X
            </button>
            <div className="chat-messages">
                {chatMessages.length === 0 ? (
                    <p>No messages yet in this chat</p>
                ) : (
                    chatMessages.data.map(msg => {
                        const isUser = msg.username === username;

                        return (
                            <div
                                key={msg._id}
                                className={`chat-message ${isUser ? 'own':'other'}`}
                            >
                                <span className="chat-message-username">{msg.username}</span>
                                <p className="chat-message-content">{msg.text}</p>
                            </div>
                        );
                    })
                    )
                }
            </div>
            <div className = "user-input">
                <textarea 
                    id="chat-input"
                    ref={ref}
                    value={message}
                    rows={1}
                    onChange={handleChange}
                    placeholder="Type your message..."
                    style={{ resize: 'none', overflow: 'hidden'}}
                />
                <button onClick={() => {
                    // Handle sending message logic here
                    console.log("Message sent: ", message);
                    sendMessage();
                }}>
                    Send
                </button>
            </div>
            
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