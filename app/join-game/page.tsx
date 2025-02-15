"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinGame() {
  const [lobbyCode, setLobbyCode] = useState("")
  const router = useRouter()

  const joinGame = () => {
    if (lobbyCode) {
      router.push(`/lobby/${lobbyCode}`)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Join a Game</h1>
      <input
        type="text"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
        placeholder="Enter lobby code"
        className="border-2 border-gray-300 rounded-md p-2 mb-4"
      />
      <button onClick={joinGame} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Join Game
      </button>
    </div>
  )
}


