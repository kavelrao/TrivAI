import { type NextRequest, NextResponse } from "next/server"
import { getQuestions } from "../../utils/game-state"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lobbyCode = searchParams.get("lobbyCode")

  if (!lobbyCode) {
    return NextResponse.json({ error: "Missing lobby code" }, { status: 400 })
  }

  const questions = getQuestions(lobbyCode)
  console.log("GET questions for lobby:", lobbyCode, "Questions:", questions)
  return NextResponse.json(questions)
}


