import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import Pusher from "pusher"
import { addPlayer } from "../../utils/game-state"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// Access the global game state
const globalForGameState = global as typeof globalThis & {
  gameStates: Record<string, {
    currentQuestion: number;
    scores: Record<string, number>;
    answeredPlayers: Record<number, Set<string>>;
    players: Set<string>;
  }>
}

if (!globalForGameState.gameStates) {
  globalForGameState.gameStates = {}
}

export async function POST(req: NextRequest) {
  const { playerName } = await req.json()
  const lobbyCode = nanoid(6)

  // Initialize game state
  globalForGameState.gameStates[lobbyCode] = {
    currentQuestion: 0,
    scores: {},
    answeredPlayers: { 0: new Set() },
    players: new Set([playerName])
  }

  // Add the player to our tracking (keeping this for backwards compatibility)
  addPlayer(lobbyCode, playerName)

  // Trigger the player-joined event for the host
  await pusher.trigger(`lobby-${lobbyCode}`, "player-joined", {
    player: playerName,
  })

  // Return the lobby code immediately so the client can navigate to the lobby page
  return NextResponse.json({ 
    lobbyCode,
    // Include the initial players list so the client can set it immediately
    players: [playerName]
  })
}


