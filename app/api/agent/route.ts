import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // kein Edge, weniger CORS/Fetch-Fallstricke

function safeString(x: any): string {
  if (x == null) return "";
  return typeof x === "string" ? x : JSON.stringify(x);
}
function pickReply(d: any): string {
  return (
    d?.output?.text ??
    d?.output_text ??
    d?.reply ??
    d?.message ??
    d?.content ??
    d?.result?.output_text ??
    d?.result?.reply ??
    ""
  );
}

async function callWorkflow(apiKey: string, workflowId: string, input: any) {
  const url = `https://api.openai.com/v1/workflows/${workflowId}/runs`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input, stream: false }),
  });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  return { ok: res.ok, status: res.status, url, data, text };
}

async function callResponses(apiKey: string, prompt: string, lang: string) {
  const url = "https://api.openai.com/v1/responses";
  const sys = lang === "it"
    ? "Sei un assistente per il sito. Rispondi in italiano, in modo breve e utile."
    : "You are a website assistant. Answer briefly and helpfully in German.";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [{ role: "system", content: sys }, { role: "user", content: prompt }],
    }),
  });
  const text = await res.text();
  let data: any = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  // Responses API formatiert i.d.R. in output_text
  const reply =
    data?.output_text ??
    pickReply(data) ??
    (typeof data === "string" ? data : JSON.stringify(data));
  return { ok: res.ok, status: res.status, url, data, text, reply };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY || "";
    const workflowId = process.env.OPENAI_WORKFLOW_ID || "";
    if (!apiKey) {
      return NextResponse.json({ error: { message: "Missing OPENAI_API_KEY" } }, { status: 500 });
    }
    const body = await req.json().catch(() => ({}));
    const { messages = [], input = "", lang = "de", meta = {} } = body || {};
    const question = safeString(input);
    const wfInput = {
      question,
      messages,
      lang,
      meta,
      client: {
        ua: req.headers.get("user-agent") || "",
        ref: req.headers.get("referer") || "",
        ip: req.headers.get("x-forwarded-for") || "",
      },
    };

    // Erst Workflows (falls ID vorhanden)
    if (workflowId) {
      const wf = await callWorkflow(apiKey, workflowId, wfInput);
      if (wf.ok) {
        const reply = pickReply(wf.data) || "…";
        return NextResponse.json({ reply, target: "workflows", url: wf.url, raw: wf.data }, { status: 200 });
      }
      // Falls typischer Fehler "Invalid URL", loggen & auf Responses fallen
      if (safeString(wf.data?.error?.message).toLowerCase().includes("invalid url")) {
        const resp = await callResponses(apiKey, question, lang);
        if (resp.ok) {
          return NextResponse.json({ reply: resp.reply, target: "responses-fallback", url: resp.url, raw: resp.data }, { status: 200 });
        }
        return NextResponse.json(
          { error: { message: resp.data?.error?.message || resp.text || "Responses failed" }, target: "responses-fallback", url: resp.url },
          { status: resp.status || 502 }
        );
      }
      // Sonst Fehler der Workflows-API durchreichen
      return NextResponse.json(
        { error: { message: wf.data?.error?.message || wf.text || "Workflow failed" }, target: "workflows", url: wf.url },
        { status: wf.status || 502 }
      );
    }

    // Keine Workflow-ID → direkt Responses
    const resp = await callResponses(apiKey, question, lang);
    if (resp.ok) {
      return NextResponse.json({ reply: resp.reply, target: "responses", url: resp.url, raw: resp.data }, { status: 200 });
    }
    return NextResponse.json(
      { error: { message: resp.data?.error?.message || resp.text || "Responses failed" }, target: "responses", url: resp.url },
      { status: resp.status || 502 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: { message: err?.message || "Unhandled server error" } }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
