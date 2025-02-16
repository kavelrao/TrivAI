import { type NextRequest, NextResponse } from "next/server"
import Pusher from "pusher"
import { getTopics, addTopic } from "../../utils/game-state"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

// In a real app, this would be stored in a database
// Using global to persist data between API route instantiations
const globalForTopics = global as typeof globalThis & {
  lobbyTopics: Record<string, string[]>
}

if (!globalForTopics.lobbyTopics) {
  globalForTopics.lobbyTopics = {}
}

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  if (!lobbyCode) {
    return NextResponse.json({ error: "Missing lobby code" }, { status: 400 })
  }

  const topics = getTopicsForLobby(lobbyCode)
  console.log("GET topics for lobby:", lobbyCode, "Topics:", topics)
  return NextResponse.json({ topics })
}

export async function POST(req: NextRequest) {
  const { lobbyCode, topic } = await req.json()
  console.log("Adding topic to lobby:", lobbyCode, "Topic:", topic)

  addTopic(lobbyCode, topic)
  const topics = getTopicsForLobby(lobbyCode)
  console.log("Updated topics for lobby:", lobbyCode, "Topics:", topics)

  await pusher.trigger(`lobby-${lobbyCode}`, "topic-added", {
    topic,
  })

  return NextResponse.json({ success: true })
}

// Helper function to get topics for a lobby
function getTopicsForLobby(lobbyCode: string): string[] {
  console.log("getTopics helper called for lobby:", lobbyCode, "Topics:", globalForTopics.lobbyTopics[lobbyCode] || [])
  return globalForTopics.lobbyTopics[lobbyCode] || []
}

