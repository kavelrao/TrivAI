import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import Pusher from "pusher"
import { getQuestions, getPlayers } from "../../utils/game-state"

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
    players: Set<string>; // Track all players in the game
    readyForNextQuestion: Record<number, Set<string>>; // Track players ready for next question
    showingAnswer: boolean; // Whether we're showing the answer screen
    pendingCorrectAnswers: Record<number, Record<string, boolean>>; // Track correct answers until all players submit
  }>
}

if (!globalForGameState.gameStates) {
  globalForGameState.gameStates = {}
}

export async function POST(req: NextRequest) {
  const { lobbyCode, playerName, question, correctAnswer, playerAnswer } = await req.json()

  // Validate required fields
  if (!lobbyCode || !playerName || !question || !correctAnswer || !playerAnswer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Initialize game state if it doesn't exist
  if (!globalForGameState.gameStates[lobbyCode]) {
    globalForGameState.gameStates[lobbyCode] = {
      currentQuestion: 0,
      scores: {},
      answeredPlayers: { 0: new Set() },
      players: new Set(),
      readyForNextQuestion: { 0: new Set() },
      showingAnswer: false,
      pendingCorrectAnswers: { 0: {} }
    }
  }

  const gameState = globalForGameState.gameStates[lobbyCode]
  
  // Verify game state is properly initialized
  if (!gameState || !gameState.players) {
    console.error("Invalid game state for lobby:", lobbyCode)
    return NextResponse.json({ error: "Invalid game state" }, { status: 500 })
  }

  // Add player to the game's players set if not already there
  gameState.players.add(playerName)
  // Initialize player's score to 0 if they don't have a score yet
  if (!(playerName in gameState.scores)) {
    gameState.scores[playerName] = 0
  }

  // Ensure all game state properties are properly initialized for the current question
  if (!gameState.answeredPlayers) {
    gameState.answeredPlayers = {}
  }
  if (!gameState.readyForNextQuestion) {
    gameState.readyForNextQuestion = {}
  }
  if (!gameState.scores) {
    gameState.scores = {}
  }
  if (!gameState.pendingCorrectAnswers) {
    gameState.pendingCorrectAnswers = {}
  }
  if (typeof gameState.currentQuestion !== 'number') {
    gameState.currentQuestion = 0
  }

  // Initialize the sets for the current question if they don't exist
  if (!gameState.answeredPlayers[gameState.currentQuestion]) {
    gameState.answeredPlayers[gameState.currentQuestion] = new Set()
  }
  if (!gameState.readyForNextQuestion[gameState.currentQuestion]) {
    gameState.readyForNextQuestion[gameState.currentQuestion] = new Set()
  }
  if (!gameState.pendingCorrectAnswers[gameState.currentQuestion]) {
    gameState.pendingCorrectAnswers[gameState.currentQuestion] = {}
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

    let isCorrect = false;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0,
      })

      if (!completion?.choices?.[0]?.message?.content) {
        console.error("Invalid OpenAI response structure:", completion)
        throw new Error("Invalid response structure from OpenAI")
      }

      const response = completion.choices[0].message.content.trim().toLowerCase()
      isCorrect = response === "yes"
      
      if (response !== "yes" && response !== "no") {
        console.error("Unexpected OpenAI response:", response)
        throw new Error("Unexpected response from OpenAI")
      }
    } catch (openaiError) {
      console.error("OpenAI API error:", openaiError)
      throw new Error("Failed to check answer with OpenAI")
    }

    // Store whether the answer was correct in pending answers
    gameState.pendingCorrectAnswers[gameState.currentQuestion][playerName] = isCorrect

    // Mark player as having answered the current question
    gameState.answeredPlayers[gameState.currentQuestion].add(playerName)

    // Get total number of players from the game state
    const totalPlayers = gameState.players.size
    const currentAnsweredPlayers = gameState.answeredPlayers[gameState.currentQuestion]

    // Notify clients about a new answer submission (without score update)
    await pusher.trigger(`game-${lobbyCode}`, "answer-submitted", {
      playerName, // Include who just answered
      currentQuestion: gameState.currentQuestion,
      totalAnswered: currentAnsweredPlayers.size,
      totalPlayers
    })

    // If all players have answered the current question
    if (currentAnsweredPlayers.size === totalPlayers) {
      // Update all players' scores
      for (const [player, isCorrect] of Object.entries(gameState.pendingCorrectAnswers[gameState.currentQuestion])) {
        if (isCorrect) {
          gameState.scores[player] = (gameState.scores[player] || 0) + 1
        }
      }

      // Get questions to check if this is the last question
      const questions = getQuestions(lobbyCode) || []
      const isLastQuestion = gameState.currentQuestion >= questions.length - 1

      if (isLastQuestion) {
        // If this is the last question, trigger game over
        await pusher.trigger(`game-${lobbyCode}`, "game-over", {
          scores: gameState.scores,
          correctAnswer,
          question,
          finalAnswers: gameState.pendingCorrectAnswers[gameState.currentQuestion]
        })
      } else {
        gameState.showingAnswer = true
        // Send event to show answer screen with updated scores
        await pusher.trigger(`game-${lobbyCode}`, "show-answer", {
          scores: gameState.scores,
          correctAnswer,
          question
        })
      }
    }

    return NextResponse.json({ 
      success: true,
      isCorrect,
      waitingForOthers: currentAnsweredPlayers.size < totalPlayers,
      totalAnswered: currentAnsweredPlayers.size,
      totalPlayers,
      showingAnswer: gameState.showingAnswer
    })
  } catch (error) {
    console.error("Error processing answer:", error)
    return NextResponse.json({ error: "Failed to process answer" }, { status: 500 })
  }
}

// Add a new endpoint to handle "ready for next question"
export async function PUT(req: NextRequest) {
  const { lobbyCode, playerName } = await req.json()
  
  const gameState = globalForGameState.gameStates[lobbyCode]
  if (!gameState) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  // Add player to ready set
  gameState.readyForNextQuestion[gameState.currentQuestion].add(playerName)
  const readyPlayers = gameState.readyForNextQuestion[gameState.currentQuestion]
  
  // If all players are ready, move to next question
  if (readyPlayers.size === gameState.players.size) {
    gameState.showingAnswer = false
    gameState.currentQuestion += 1
    gameState.answeredPlayers[gameState.currentQuestion] = new Set()
    gameState.readyForNextQuestion[gameState.currentQuestion] = new Set()

    // Notify all clients to move to next question
    await pusher.trigger(`game-${lobbyCode}`, "next-question", {
      questionNumber: gameState.currentQuestion,
      scores: gameState.scores
    })
  }

  return NextResponse.json({ 
    success: true,
    readyCount: readyPlayers.size,
    totalPlayers: gameState.players.size
  })
}


