import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Pusher from "pusher"

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// In a real app, this would be stored in a database
const globalForGameState = global as typeof globalThis & {
  gameStates: Record<string, {
    currentQuestion: number;
    scores: Record<string, number>;
    answeredPlayers: Record<number, Set<string>>; // Track answers per question
  }>
}

if (!globalForGameState.gameStates) {
  globalForGameState.gameStates = {}
}

export async function POST(req: NextRequest) {
  const { lobbyCode, playerName, question, correctAnswer, playerAnswer } = await req.json()

  // Initialize game state if it doesn't exist
  if (!globalForGameState.gameStates[lobbyCode]) {
    globalForGameState.gameStates[lobbyCode] = {
      currentQuestion: 0,
      scores: {},
      answeredPlayers: { 0: new Set() }
    }
  }

  const gameState = globalForGameState.gameStates[lobbyCode]

  // Initialize the set for the current question if it doesn't exist
  if (!gameState.answeredPlayers[gameState.currentQuestion]) {
    gameState.answeredPlayers[gameState.currentQuestion] = new Set()
  }

  // If player has already answered current question, ignore
  if (gameState.answeredPlayers[gameState.currentQuestion].has(playerName)) {
    return NextResponse.json({ error: "Already answered this question" }, { status: 400 })
  }

  try {
    const prompt = `
      Question: "${question}"
      Correct answer: "${correctAnswer}"
      Player's answer: "${playerAnswer}"
      
      Is the player's answer correct? Please respond with only "yes" or "no".
    `

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
    })

    const isCorrect = completion.choices[0].message.content?.trim().toLowerCase() === "yes"

    // Update player's score
    if (isCorrect) {
      gameState.scores[playerName] = (gameState.scores[playerName] || 0) + 1
    }

    // Mark player as having answered the current question
    gameState.answeredPlayers[gameState.currentQuestion].add(playerName)

    // Get total number of players from the scores object
    const totalPlayers = Object.keys(gameState.scores).length || 2 // Default to 2 if no scores yet
    const currentAnsweredPlayers = gameState.answeredPlayers[gameState.currentQuestion]

    // Update scores immediately for all clients
    await pusher.trigger(`game-${lobbyCode}`, "score-update", {
      scores: gameState.scores,
      playerName, // Include who just answered
      currentQuestion: gameState.currentQuestion,
      totalAnswered: currentAnsweredPlayers.size,
      totalPlayers
    })

    // If all players have answered the current question
    if (currentAnsweredPlayers.size === totalPlayers) {
      // Wait a moment to ensure all clients have received their score updates
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Prepare for next question
      gameState.currentQuestion += 1
      gameState.answeredPlayers[gameState.currentQuestion] = new Set()

      // Notify all clients to move to next question
      await pusher.trigger(`game-${lobbyCode}`, "next-question", {
        questionNumber: gameState.currentQuestion,
        scores: gameState.scores
      })
    }

    return NextResponse.json({ 
      success: true,
      isCorrect,
      waitingForOthers: currentAnsweredPlayers.size < totalPlayers,
      totalAnswered: currentAnsweredPlayers.size,
      totalPlayers
    })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 })
  }
}


