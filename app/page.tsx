"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [reply, setReply] = useState<string>("");

  async function send() {
    setReply("…sende an Agent…");
    const r = await fetch("/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await r.json();
    setReply(JSON.stringify(data, null, 2));
  }

  return (
    <main style={{ maxWidth: 680, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>💬 Web Assistant</h1>
      <p>Frag mich etwas – dein OpenAI-Agent antwortet.</p>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={4}
        style={{ width: "100%", padding: 8 }}
        placeholder="Deine Frage…"
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={send} style={{ padding: "8px 14px" }}>Senden</button>
      </div>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>{reply}</pre>
    </main>
  );
}
