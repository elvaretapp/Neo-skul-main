import { useState, useRef, useEffect } from 'react'
import '../styles/ChatModal.css'

function ChatModal({ isOpen, onClose, mentor }) {
    const [message, setMessage] = useState('')
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'mentor',
            text: `Halo! Saya ${mentor?.name || 'Mentor'}. Ada yang bisa saya bantu?`,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        }
    ])
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (message.trim()) {
            // Add user message
            const newMessage = {
                id: messages.length + 1,
                sender: 'user',
                text: message,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            }
            setMessages([...messages, newMessage])
            setMessage('')

            // Simulate mentor reply after 1 second
            setTimeout(() => {
                const mentorReply = {
                    id: messages.length + 2,
                    sender: 'mentor',
                    text: 'Terima kasih atas pertanyaannya! Saya akan segera membantu Anda.',
                    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                }
                setMessages(prev => [...prev, mentorReply])
            }, 1000)
        }
    }

    if (!isOpen) return null

    return (
        <div className="chat-modal-overlay" onClick={onClose}>
            <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Chat Header */}
                <div className="chat-header">
                    <div className="chat-mentor-info">
                        <img
                            src={mentor?.image || '/images/mentors/default.jpg'}
                            alt={mentor?.name}
                            className="chat-mentor-avatar"
                        />
                        <div className="chat-mentor-details">
                            <h3>{mentor?.name || 'Mentor'}</h3>
                            <p className="chat-mentor-status">
                                <span className="status-dot online"></span>
                                Online
                            </p>
                        </div>
                    </div>
                    <button className="chat-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {/* Chat Messages */}
                <div className="chat-messages">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`chat-message ${msg.sender === 'user' ? 'user-message' : 'mentor-message'}`}
                        >
                            {msg.sender === 'mentor' && (
                                <img
                                    src={mentor?.image || '/images/mentors/default.jpg'}
                                    alt={mentor?.name}
                                    className="message-avatar"
                                />
                            )}
                            <div className="message-content">
                                <p>{msg.text}</p>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Ketik pesan Anda..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button type="submit" className="chat-send-btn">
                        <i className="fas fa-paper-plane"></i>
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChatModal
