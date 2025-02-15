import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  // Here you would typically fetch the questions from a database
  // For this example, we'll return dummy data
  const questions = [
    { question: "What is the capital of France?", answer: "Paris" },
    { question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
    // ... add 8 more questions
  ]

  return NextResponse.json(questions)
}


