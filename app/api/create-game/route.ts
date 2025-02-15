import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

export async function POST() {
  const lobbyCode = nanoid(6)
  // Here you would typically save the lobby code to a database
  return NextResponse.json({ lobbyCode })
}


