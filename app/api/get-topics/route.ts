import { type NextRequest, NextResponse } from "next/server"
import { getTopics } from "../add-topic/route"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  if (!lobbyCode) {
    return NextResponse.json({ error: "Missing lobby code" }, { status: 400 })
  }

  const topics = getTopics(lobbyCode)
  return NextResponse.json({ topics })
} 