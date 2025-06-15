"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Session = {
    id: string;
    createdAt: string;
};

export default function ChatListPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem("vibe-user-id");
        if (!userId) {
            router.push("/");
            return;
        }

        const fetchSessions = async () => {
            const res = await fetch(`/api/user-sessions?userId=${userId}`);
            const data = await res.json();
            setSessions(data.sessions);
            setLoading(false);
        };

        fetchSessions();
    }, []);

    const handleStartNewChat = () => {
        const newId = crypto.randomUUID();
        localStorage.setItem("vibe-session-id", newId);
        router.push(`/chat/${newId}`);
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">🧵 Your Chat Sessions</h1>
            {loading ? (
                <p className="text-center">Loading...</p>
            ) : (
                <div className="space-y-4 max-w-md mx-auto">
                    {sessions.map((s) => (
                        <div
                            key={s.id}
                            className="p-4 border rounded-md bg-white shadow cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                localStorage.setItem("vibe-session-id", s.id);
                                router.push(`/chat/${s.id}`);
                            }}
                        >
                            <p className="text-sm">Session: {s.id.slice(0, 8)}...</p>
                            <p className="text-xs text-gray-500">
                                Started on {new Date(s.createdAt).toLocaleString()}
                            </p>
                        </div>
                    ))}

                    <button
                        onClick={handleStartNewChat}
                        className="w-full bg-black text-white py-2 rounded-md mt-4"
                    >
                        + Start New Chat
                    </button>
                </div>
            )}
        </main>
    );
}
