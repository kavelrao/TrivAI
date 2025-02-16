import { type NextRequest, NextResponse } from "next/server"

// In a real app, this would be stored in a database
const lobbyPlayers: Record<string, string[]> = {}

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  if (!lobbyCode) {
    return NextResponse.json({ error: "Missing lobby code" }, { status: 400 })
  }

  return NextResponse.json({ players: lobbyPlayers[lobbyCode] || [] })
}

// This is a helper function that other routes can use to add players
export function addPlayer(lobbyCode: string, playerName: string) {
  if (!lobbyPlayers[lobbyCode]) {
    lobbyPlayers[lobbyCode] = []
  }
  lobbyPlayers[lobbyCode].push(playerName)
} 