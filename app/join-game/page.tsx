"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function JoinGame() {
  const [lobbyCode, setLobbyCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const router = useRouter()

  const joinGame = async () => {
    if (!lobbyCode || !playerName) return
    
    await fetch("/api/join-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyCode, playerName }),
    })
    
    router.push(`/lobby/${lobbyCode}?playerName=${encodeURIComponent(playerName)}`)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Join a Game</h1>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Enter your name"
        className="border-2 border-gray-300 rounded-[1rem] p-3 mb-4 w-64 text-center focus:outline-none focus:border-purple-500"
      />
      <input
        type="text"
        value={lobbyCode}
        onChange={(e) => setLobbyCode(e.target.value)}
        placeholder="Enter lobby code"
        className="border-2 border-gray-300 rounded-[1rem] p-3 mb-4 w-64 text-center focus:outline-none focus:border-purple-500"
      />
      <button 
        onClick={joinGame} 
        className="group transition-all"
        disabled={!lobbyCode || !playerName}
      >
        <div className="bg-purple-500 rounded-[2rem] p-1">
          <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
            <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
              Join Game
            </span>
          </div>
        </div>
      </button>
    </div>
  )
}


