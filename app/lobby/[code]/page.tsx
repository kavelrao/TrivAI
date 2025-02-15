"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js"

export default function Lobby({ params }: { params: { code: string } }) {
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")
  const [players, setPlayers] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`lobby-${params.code}`)
    channel.bind("player-joined", (data: { player: string }) => {
      setPlayers((prevPlayers) => [...prevPlayers, data.player])
    })
    channel.bind("topic-added", (data: { topic: string }) => {
      setTopics((prevTopics) => [...prevTopics, data.topic])
    })
    channel.bind("game-started", () => {
      router.push(`/game/${params.code}`)
    })

    return () => {
      pusher.unsubscribe(`lobby-${params.code}`)
    }
  }, [params.code, router])

  const addTopic = async () => {
    if (newTopic && topics.length < 4) {
      await fetch("/api/add-topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobbyCode: params.code, topic: newTopic }),
      })
      setNewTopic("")
    }
  }

  const startGame = async () => {
    await fetch("/api/start-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lobbyCode: params.code }),
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Lobby: {params.code}</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Players:</h2>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Topics:</h2>
        <ul>
          {topics.map((topic, index) => (
            <li key={index}>{topic}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          placeholder="Enter a topic"
          className="border-2 border-gray-300 rounded-md p-2 mr-2"
        />
        <button onClick={addTopic} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Add Topic
        </button>
      </div>
      {players.length === 2 && topics.length >= 2 && (
        <button onClick={startGame} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Start Game
        </button>
      )}
    </div>
  )
}


