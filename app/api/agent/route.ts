import { NextResponse } from "next/server";

export async function GET(){
  return NextResponse.json({ ok:true, route:"/api/agent", method:"GET" });
}

export async function POST(req:Request){
  try{
    const { message } = await req.json();
    const WORKFLOW_ID = process.env.OPENAI_WORKFLOW_ID;
    const API_KEY = process.env.OPENAI_API_KEY;

    if(!WORKFLOW_ID || !API_KEY){
      return NextResponse.json({ error:"Missing OPENAI_WORKFLOW_ID or OPENAI_API_KEY" }, { status:500 });
    }

    async function run(body:unknown){
      return fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,{
        method:"POST",
        headers:{ Authorization:`Bearer ${API_KEY}`, "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
    }

    let res = await run({ input:{ message } });
    if(res.status===400) res = await run({ inputs:{ message } });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }catch(err){
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status:500 });
  }
}
