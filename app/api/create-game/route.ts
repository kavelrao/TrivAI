import { type NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import Pusher from "pusher"
import { addPlayer } from "../get-players/route"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(req: NextRequest) {
  const { playerName } = await req.json()
  const lobbyCode = nanoid(6)

  // First add the player to our tracking
  addPlayer(lobbyCode, playerName)

  // Trigger the player-joined event for the host
  await pusher.trigger(`lobby-${lobbyCode}`, "player-joined", {
    player: playerName,
  })

  // Return the lobby code immediately so the client can navigate to the lobby page
  // We'll trigger the Pusher event after they're already in the lobby
  return NextResponse.json({ 
    lobbyCode,
    // Include the initial players list so the client can set it immediately
    players: [playerName]
  })
}


