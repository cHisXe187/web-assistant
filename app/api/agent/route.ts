import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ status: "ok", route: "/api/agent", method: "GET" });
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID;
    const API_KEY = process.env.OPENAI_API_KEY;

    // Fallback: Zeig sinnvolle Fehlermeldung statt leerer 500er
    if (!WORKFLOW_ID || !API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_WORKFLOW_ID or OPENAI_API_KEY env vars." },
        { status: 500 }
      );
    }

    // Manche Workflows erwarten 'input', andere 'inputs' → beide probieren
    async function run(body: any) {
      return fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
    }

    let res = await run({ input: { message } });
    if (res.status === 400) res = await run({ inputs: { message } });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 500 });
  }
}
