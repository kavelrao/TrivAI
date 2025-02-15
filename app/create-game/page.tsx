"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateGame() {
  const [lobbyCode, setLobbyCode] = useState("")
  const router = useRouter()

  const createGame = async () => {
    const response = await fetch("/api/create-game", { method: "POST" })
    const data = await response.json()
    setLobbyCode(data.lobbyCode)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Create a Game</h1>
      <button
        onClick={createGame}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Generate Lobby Code
      </button>
      {lobbyCode && (
        <div>
          <p className="text-xl mb-4">
            Your lobby code is: <span className="font-bold">{lobbyCode}</span>
          </p>
          <button
            onClick={() => router.push(`/lobby/${lobbyCode}`)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Enter Lobby
          </button>
        </div>
      )}
    </div>
  )
}


