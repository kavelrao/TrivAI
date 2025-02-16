import { type NextRequest, NextResponse } from "next/server"
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
  const { lobbyCode, playerName } = await req.json()

  // Initialize game state if it doesn't exist
  if (!globalForGameState.gameStates[lobbyCode]) {
    globalForGameState.gameStates[lobbyCode] = {
      currentQuestion: 0,
      scores: {},
      answeredPlayers: { 0: new Set() },
      players: new Set()
    }
  }

  // Add player to the game state
  globalForGameState.gameStates[lobbyCode].players.add(playerName)

  // Add the player to our tracking (keeping this for backwards compatibility)
  addPlayer(lobbyCode, playerName)

  await pusher.trigger(`lobby-${lobbyCode}`, "player-joined", {
    player: playerName,
  })

  return NextResponse.json({ success: true })
} 