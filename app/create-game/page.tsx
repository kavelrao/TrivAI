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
        className="border-2 border-gray-300 rounded-[1rem] p-3 mb-4 w-64 text-center focus:outline-none focus:border-purple-500"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && playerName) {
            createGame()
          }
        }}
      />
      <button
        onClick={createGame}
        className="group transition-all"
        disabled={!playerName || isCreating}
      >
        <div className="bg-purple-500 rounded-[2rem] p-1">
          <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
            <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
              {isCreating ? "Creating..." : "Create Game"}
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}


