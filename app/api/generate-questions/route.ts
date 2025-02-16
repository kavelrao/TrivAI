import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { QUESTIONS_PER_GAME } from "../../utils/game-state"

export async function POST(req: NextRequest) {
  const { topics } = await req.json()

  const prompt = `Generate ${QUESTIONS_PER_GAME} trivia questions and answers based on the following topics: ${topics.join(", ")}. Format the output as a JSON array of objects, each with 'question' and 'answer' properties. Do NOT create any question where the topic is the answer.`

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
    })

    const questions = JSON.parse(text)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Error generating questions:", error)
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 })
  }
}


