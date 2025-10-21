import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // avoid Edge for easier fetch/env

function pickReply(data: any): string {
  // Versucht gängige Felder der Workflows-Antwort
  return (
    data?.output?.text ??
    data?.output_text ??
    data?.reply ??
    data?.message ??
    data?.content ??
    // Responses aus verschachtelten Strukturen
    data?.result?.output_text ??
    data?.result?.reply ??
    JSON.stringify(data)
  );
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const workflowId = process.env.OPENAI_WORKFLOW_ID;

    if (!apiKey || !workflowId) {
      return NextResponse.json(
        { error: { message: "Missing OPENAI_API_KEY or OPENAI_WORKFLOW_ID" } },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { messages = [], input = "", lang = "de", meta = {} } = body || {};

    // Baue ein neutrales Input-Objekt für den Workflow
    const workflowInput = {
      question: (typeof input === "string" ? input : String(input ?? "")) || "",
      messages,
      lang,
      meta,
      // nützlich: client info
      client: {
        ua: req.headers.get("user-agent") || "",
        ip: req.headers.get("x-forwarded-for") || "",
        referer: req.headers.get("referer") || "",
      },
    };

    const url = `https://api.openai.com/v1/workflows/${workflowId}/runs`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      // stream=false => einfache JSON-Antwort
      body: JSON.stringify({ input: workflowInput, stream: false }),
      // serverseitig ok
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try { data = text ? JSON.parse(text) : {}; } catch {
      // lasse text in Fehlermeldung zurückfallen
      data = { raw: text };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: { message: data?.error?.message || text || "OpenAI request failed" } },
        { status: res.status }
      );
    }

    const reply = pickReply(data) || "…";

    return NextResponse.json({ reply, raw: data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err?.message || "Unhandled server error" } },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  // CORS optional (nicht nötig, da iframe auf gleicher Origin /api/agent trifft)
  return NextResponse.json({}, { status: 200 });
}
