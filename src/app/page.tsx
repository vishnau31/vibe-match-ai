"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);

    const res = await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username }),
    });

    const data = await res.json();

    localStorage.setItem("vibe-username", data.name);
    localStorage.setItem("vibe-user-id", data.id);

    router.push("/chats");
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6 space-y-4 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-center">Enter your name</h2>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g. Priya"
          className="w-full px-4 py-2 border rounded-md"
        />
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md"
          disabled={loading}
        >
          {loading ? "Starting..." : "Start Chat"}
        </button>
      </form>
    </main>
  );
}
