"use client";
import { useEffect, useRef, useState } from "react";
type Msg = { role: "user" | "assistant"; content: string };
const qs = (k: string, d = "") =>
  typeof window === "undefined" ? d : new URLSearchParams(window.location.search).get(k) ?? d;

export const dynamic = 'force-dynamic';

export default function Embed() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = qs("theme", "light");
  const lang = qs("lang", "de");
  const welcome = qs("welcome", lang === "it" ? "Come posso aiutarti?" : "Wie kann ich helfen?");
  const sessionKey = qs("session", "wa_default");
  const booted = useRef(false);

  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const saved = localStorage.getItem(`wa_msgs_${sessionKey}`);
    setMessages(saved ? JSON.parse(saved) : [{ role: "assistant", content: welcome }]);
  }, [sessionKey, welcome]);

  useEffect(() => {
    localStorage.setItem(`wa_msgs_${sessionKey}`, JSON.stringify(messages));
  }, [messages, sessionKey]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, input: text, lang })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json(); // { reply: string }
      setMessages((m) => [...m, { role: "assistant", content: data.reply ?? "…" }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Fehler beim Senden. Bitte nochmal." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`h-screen w-screen ${theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"} flex flex-col`}>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] px-3 py-2 rounded-xl shadow ${m.role === "user" ? "ml-auto bg-blue-100" : "mr-auto bg-zinc-100"} ${theme==="dark" ? (m.role==="user" ? "bg-blue-900/40" : "bg-zinc-800") : ""}`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
          </div>
        ))}
        {loading && <div className="text-xs opacity-70">…schreibe…</div>}
      </div>
      <div className={`p-3 border-t ${theme==="dark" ? "border-zinc-800" : "border-zinc-200"}`}>
        <div className="flex gap-2">
          <input
            className={`flex-1 rounded-xl px-3 py-2 outline-none border ${theme==="dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300"}`}
            placeholder={lang === "it" ? "La tua domanda…" : "Deine Frage…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); send(); } }}
          />
          <button onClick={send} disabled={loading} className="rounded-xl px-4 py-2 bg-blue-600 text-white disabled:opacity-50">
            {lang === "it" ? "Invia" : "Senden"}
          </button>
        </div>
      </div>
    </div>
  );
}
