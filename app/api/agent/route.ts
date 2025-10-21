import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID!;
    const API_KEY = process.env.OPENAI_API_KEY!;

    const response = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { message },
        }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Error" }, { status: 500 });
  }
}
