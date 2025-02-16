import { type NextRequest, NextResponse } from "next/server"
import Pusher from "pusher"
import { getTopics } from "../add-topic/route"
import OpenAI from "openai"

export const QUESTIONS_PER_GAME = 5

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
// Using global to persist data between API route instantiations
const globalForQuestions = global as typeof globalThis & {
  lobbyQuestions: Record<string, Array<{ question: string; answer: string }>>
}

if (!globalForQuestions.lobbyQuestions) {
  globalForQuestions.lobbyQuestions = {}
}

export async function POST(req: NextRequest) {
  const { lobbyCode } = await req.json()
  console.log("Starting game for lobby:", lobbyCode)
  
  const topics = getTopics(lobbyCode)
  console.log("Found topics:", topics)

  if (!topics || topics.length < 2) {
    console.log("Not enough topics found")
    return NextResponse.json({ error: "Not enough topics found" }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a trivia question generator. You must ALWAYS respond with a valid JSON array of exactly ${QUESTIONS_PER_GAME} question objects.
Each object MUST have exactly two fields: "question" and "answer".
Example format:
[
  {"question": "What is 2+2?", "answer": "4"},
  {"question": "Who wrote Romeo and Juliet?", "answer": "William Shakespeare"}
]`
        },
        {
          role: "user",
          content: `Generate ${QUESTIONS_PER_GAME} trivia questions about these topics: ${topics.join(", ")}. 
Remember to ONLY respond with the JSON array, no other text.`
        }
      ],
      temperature: 0.7,
    })

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error("No response from OpenAI")
    }

    try {
      const questions = JSON.parse(response.trim())
      if (!Array.isArray(questions) || questions.length !== QUESTIONS_PER_GAME || !questions.every(q => q.question && q.answer)) {
        throw new Error("Invalid question format received from OpenAI")
      }
      globalForQuestions.lobbyQuestions[lobbyCode] = questions
      console.log("Stored questions for lobby:", lobbyCode, "Questions:", questions)
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", response)
      throw new Error("Failed to parse questions from OpenAI")
    }

    await pusher.trigger(`lobby-${lobbyCode}`, "game-started", {})
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in start-game:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 })
  }
}

// Helper function to get questions for a lobby
export function getQuestions(lobbyCode: string) {
  const questions = globalForQuestions.lobbyQuestions[lobbyCode] || []
  console.log("Getting questions for lobby:", lobbyCode, "Questions:", questions)
  return questions
}


