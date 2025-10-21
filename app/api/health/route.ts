import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    ok: true,
    env: {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      OPENAI_WORKFLOW_ID: !!process.env.OPENAI_WORKFLOW_ID,
    }
  });
}
