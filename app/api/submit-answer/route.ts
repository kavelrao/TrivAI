import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import Pusher from "pusher"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export async function POST(req: NextRequest) {
  const { lobbyCode, question, correctAnswer, playerAnswer } = await req.json()

  const prompt = `
    Question: "${question}"
    Correct answer: "${correctAnswer}"
    Player's answer: "${playerAnswer}"
    
    Is the player's answer correct? Please respond with only "yes" or "no".
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    const isCorrect = text.trim().toLowerCase() === "yes"

    // Here you would typically update the scores in a database
    // For this example, we'll use dummy data
    const scores = {
      player1: 5,
      player2: 3,
    }

    await pusher.trigger(`game-${lobbyCode}`, "score-update", { scores })

    // Check if the game is over (10 questions answered)
    // This logic should be implemented based on your game state
    const isGameOver = false // Placeholder

    if (isGameOver) {
      await pusher.trigger(`game-${lobbyCode}`, "game-over", {})
    }

    return NextResponse.json({ success: true, isCorrect })
  } catch (error) {
    console.error("Error scoring answer:", error)
    return NextResponse.json({ error: "Failed to score answer" }, { status: 500 })
  }
}


