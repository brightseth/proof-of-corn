import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  const filePath = join(process.cwd(), "public", ".well-known", "agent.json");
  const data = JSON.parse(readFileSync(filePath, "utf-8"));
  return NextResponse.json(data);
}
