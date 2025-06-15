"use client";

import { useEffect, useRef, useState } from "react";

interface Message {
    sender: "user" | "agent";
    text: string;
}

interface ChatProps {
    sessionId: string;
}

export default function Chat({ sessionId }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            console.log({ sessionId })
            const res = await fetch(`/api/chat/${sessionId}`);
            const data = await res.json();
            console.log({ data })
            if (!data.exists) {
                setMessages([]); // new session
            } else {
                setMessages(data.messages || []);
            }
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userId = localStorage.getItem("vibe-user-id") || "";
        const userMsg: Message = { sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);
        console.log({ sessionId })
        try {
            await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, userMessage: input, userId }),
            });

            await fetchMessages();
        } catch (err) {
            console.error("Failed to send message:", err);
        }

        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="border rounded-lg p-4 h-[60vh] overflow-y-auto bg-white shadow">
                {messages.map((msg, i) => (
                    <div key={i} className={`my-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
                        <div
                            className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${msg.sender === "user" ? "bg-blue-200" : "bg-gray-200"
                                } text-black`}
                        >
                            <pre className="whitespace-pre-wrap text-sm">{msg.text}</pre>
                        </div>
                    </div>
                ))}
                {loading && <p className="text-sm text-gray-400 mt-2">Typing...</p>}
                <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2 mt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your vibe..."
                    className="flex-1 border px-3 py-2 rounded-md"
                />
                <button type="submit" className="bg-black text-white px-4 py-2 rounded-md">
                    Send
                </button>
            </form>
        </div>
    );
}
