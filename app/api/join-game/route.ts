import { type NextRequest, NextResponse } from "next/server"
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
  const { lobbyCode, playerName } = await req.json()

  // Add the player to our tracking
  addPlayer(lobbyCode, playerName)

  await pusher.trigger(`lobby-${lobbyCode}`, "player-joined", {
    player: playerName,
  })

  return NextResponse.json({ success: true })
} 