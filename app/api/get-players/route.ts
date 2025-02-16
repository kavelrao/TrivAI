import { type NextRequest, NextResponse } from "next/server"
import { getPlayers } from "../../utils/game-state"

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  if (!lobbyCode) {
    return NextResponse.json({ error: "Missing lobby code" }, { status: 400 })
  }

  return NextResponse.json({ players: getPlayers(lobbyCode) })
} 