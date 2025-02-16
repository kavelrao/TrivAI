"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateGame() {
  const [isCreating, setIsCreating] = useState(false)
  const [playerName, setPlayerName] = useState("")
  const router = useRouter()

  const createGame = async () => {
    if (!playerName || isCreating) return
    setIsCreating(true)
    
    try {
      const response = await fetch("/api/create-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerName })
      })
      const data = await response.json()
      router.push(`/lobby/${data.lobbyCode}?playerName=${encodeURIComponent(playerName)}`)
    } catch (error) {
      setIsCreating(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Create a Game</h1>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        className="border-2 border-gray-300 rounded-md p-2 mb-4"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && playerName) {
            createGame()
          }
        }}
      />
      <button
        onClick={createGame}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={!playerName || isCreating}
      >
        {isCreating ? "Creating..." : "Create Game"}
      </button>
    </div>
  )
}


