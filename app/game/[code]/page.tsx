"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Pusher from "pusher-js"

interface Question {
  question: string
  answer: string
}

export default function Game({ params }: { params: { code: string } }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState("")
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameOver, setGameOver] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchQuestions = async () => {
      const response = await fetch(`/api/get-questions?lobbyCode=${params.code}`)
      const data = await response.json()
      setQuestions(data)
    }
    fetchQuestions()

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })

    const channel = pusher.subscribe(`game-${params.code}`)
    channel.bind("score-update", (data: { scores: { player1: number; player2: number } }) => {
      setScores(data.scores)
    })
    channel.bind("game-over", () => {
      setGameOver(true)
    })

    return () => {
      pusher.unsubscribe(`game-${params.code}`)
    }
  }, [params.code])

  const submitAnswer = async () => {
    await fetch("/api/submit-answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lobbyCode: params.code,
        question: questions[currentQuestion].question,
        correctAnswer: questions[currentQuestion].answer,
        playerAnswer: answer,
      }),
    })
    setAnswer("")
    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold mb-8">Game Over!</h1>
        <p className="text-2xl mb-4">Final Scores:</p>
        <p className="text-xl mb-2">Player 1: {scores.player1}</p>
        <p className="text-xl mb-4">Player 2: {scores.player2}</p>
        <p className="text-2xl font-bold">
          {scores.player1 > scores.player2
            ? "Player 1 Wins!"
            : scores.player2 > scores.player1
              ? "Player 2 Wins!"
              : "It's a Tie!"}
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Play Again
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Trivia Game</h1>
      {questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1}:</h2>
          <p className="text-xl mb-4">{questions[currentQuestion].question}</p>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Your answer"
            className="border-2 border-gray-300 rounded-md p-2 mr-2"
          />
          <button
            onClick={submitAnswer}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Answer
          </button>
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold mb-4">Scores:</h2>
        <p className="text-xl mb-2">Player 1: {scores.player1}</p>
        <p className="text-xl">Player 2: {scores.player2}</p>
      </div>
    </div>
  )
}


