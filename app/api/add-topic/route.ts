import { type NextRequest, NextResponse } from "next/server"
import Pusher from "pusher"

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

  console.log("GET topics for lobby:", lobbyCode, "Topics:", globalForTopics.lobbyTopics[lobbyCode] || [])
  return NextResponse.json({ topics: globalForTopics.lobbyTopics[lobbyCode] || [] })
}

export async function POST(req: NextRequest) {
  const { lobbyCode, topic } = await req.json()
  console.log("Adding topic to lobby:", lobbyCode, "Topic:", topic)

  // Add the topic to our tracking
  if (!globalForTopics.lobbyTopics[lobbyCode]) {
    globalForTopics.lobbyTopics[lobbyCode] = []
  }
  globalForTopics.lobbyTopics[lobbyCode].push(topic)
  console.log("Updated topics for lobby:", lobbyCode, "Topics:", globalForTopics.lobbyTopics[lobbyCode])

  await pusher.trigger(`lobby-${lobbyCode}`, "topic-added", {
    topic,
  })

  return NextResponse.json({ success: true })
}

// Helper function to get topics for a lobby
export function getTopics(lobbyCode: string): string[] {
  console.log("getTopics helper called for lobby:", lobbyCode, "Topics:", globalForTopics.lobbyTopics[lobbyCode] || [])
  return globalForTopics.lobbyTopics[lobbyCode] || []
}

