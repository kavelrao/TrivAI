import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: NextRequest) {
  const { topics } = await req.json()

  const prompt = `Generate 10 trivia questions and answers based on the following topics: ${topics.join(", ")}. Format the output as a JSON array of objects, each with 'question' and 'answer' properties.`

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


