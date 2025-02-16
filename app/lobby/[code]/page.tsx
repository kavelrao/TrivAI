"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Pusher from "pusher-js"

export default function Lobby({ params }: { params: { code: string } }) {
  const [topics, setTopics] = useState<string[]>([])
  const [newTopic, setNewTopic] = useState("")
  const [otherPlayers, setOtherPlayers] = useState<string[]>([])
  const searchParams = useSearchParams()
  const playerName = searchParams.get("playerName") || "Unknown Player"
  const router = useRouter()

  useEffect(() => {
    // Fetch initial player list and topics
    const fetchInitialData = async () => {
      const [playersResponse, topicsResponse] = await Promise.all([
        fetch(`/api/get-players?lobbyCode=${params.code}`),
        fetch(`/api/get-topics?lobbyCode=${params.code}`)
      ])
      
      const playersData = await playersResponse.json()
      const topicsData = await topicsResponse.json()

      // Filter out the current player from the fetched list
      setOtherPlayers(playersData.players.filter(p => p !== playerName))
      setTopics(topicsData.topics || [])
    }
    fetchInitialData()

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`lobby-${params.code}`)
    channel.bind("player-joined", (data: { player: string }) => {
      if (data.player !== playerName) {
        setOtherPlayers(prev => [...prev, data.player])
      }
    })
    channel.bind("topic-added", (data: { topic: string }) => {
      setTopics((prevTopics) => [...prevTopics, data.topic])
    })
    channel.bind("game-started", () => {
      router.push(`/game/${params.code}?playerName=${encodeURIComponent(playerName)}`)
    })

    return () => {
      pusher.unsubscribe(`lobby-${params.code}`)
    }
  }, [params.code, router, playerName])

  const addTopic = async () => {
    if (newTopic && topics.length < 4) {
      try {
        const response = await fetch("/api/add-topic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lobbyCode: params.code, topic: newTopic }),
        })
        if (!response.ok) {
          console.error("Failed to add topic:", await response.json())
        }
      } catch (error) {
        console.error("Error adding topic:", error)
      }
      setNewTopic("")
    }
  }

  const startGame = async () => {
    try {
      const response = await fetch("/api/start-game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lobbyCode: params.code }),
      })
      if (!response.ok) {
        const data = await response.json()
        console.error("Failed to start game:", data.error)
      }
    } catch (error) {
      console.error("Error starting game:", error)
    }
  }

  // Combine current player with other players for display
  const allPlayers = [playerName, ...otherPlayers]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="absolute top-4 right-4 text-gray-600">
        Playing as: <span className="font-bold">{playerName}</span>
      </div>
      <h1 className="text-4xl font-bold mb-8">Lobby: {params.code}</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Players:</h2>
        <ul>
          {allPlayers.map((player, index) => (
            <li key={index} className={player === playerName ? "font-bold" : ""}>
              {player} {player === playerName ? "(you)" : ""}
            </li>
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
          className="border-2 border-gray-300 rounded-[1rem] p-3 mr-4 w-64 text-center focus:outline-none focus:border-purple-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTopic()
            }
          }}
        />
        <button onClick={addTopic} className="group transition-all">
          <div className="bg-purple-500 rounded-[2rem] p-1">
            <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
              <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
                Add Topic
              </span>
            </div>
          </div>
        </button>
      </div>
      {allPlayers.length === 2 && topics.length >= 2 && (
        <button onClick={startGame} className="group transition-all">
          <div className="bg-purple-500 rounded-[2rem] p-1">
            <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
              <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
                Start Game
              </span>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}


