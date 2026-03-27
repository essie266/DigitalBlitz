import React, { useState, useRef, useEffect } from "react";
import "./ChatPage.css";

const avatar = "/avatar.png"; // Place your avatar image in public/ as avatar.png

const initialMessages = [
  {
    id: 1,
    sender: "agent",
    text: "Hello 👋 How can we help?",
    time: "now",
  },
];

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        sender: "user",
        text: input,
        time: "now",
      },
    ]);
    setInput("");
    // Simulate agent reply after 1s
    setTimeout(() => {
      setMessages((msgs) => [
        ...msgs,
        {
          id: msgs.length + 1,
          sender: "agent",
          text: "Thanks for your message! An agent will reply soon.",
          time: "now",
        },
      ]);
    }, 1000);
  };

  return (
    <div className="chat-bg">
      <div className="chat-container">
        <header className="chat-header">
          <img src={avatar} alt="avatar" className="avatar" />
          <div className="brand">
            <span className="brand-title">sequencecommerce</span>
            <span className="brand-desc">Customer Service</span>
          </div>
          <select className="lang-select">
            <option>EN</option>
            <option>FR</option>
            <option>ES</option>
          </select>
        </header>
        <main className="chat-main">
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={
                  msg.sender === "user"
                    ? "chat-bubble user"
                    : "chat-bubble agent"
                }
              >
                <span>{msg.text}</span>
                <div className="chat-time">{msg.time}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </main>
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            className="chat-input"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="send-btn" type="submit">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
