"use client";

import { useEffect, useState } from "react";
import Chat from "@/components/chat";
import { useParams, useRouter } from "next/navigation";

export default function ChatPage() {
    const router = useRouter();

    const params = useParams<{ id: string }>()
    const [username, setUsername] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("vibe-username");
        if (!stored) {
            router.push("/");
        } else {
            setUsername(stored);
        }

        localStorage.setItem("vibe-session-id", params.id);
    }, [params.id, router]);

    if (!username) return null;

    return (
        <main className="min-h-screen bg-gray-50 py-10">
            <h1 className="text-center text-2xl font-bold mb-6">Vibe Mapping Agent</h1>
            <Chat sessionId={params.id} />
        </main>
    );
}
