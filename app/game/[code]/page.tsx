"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Pusher from "pusher-js"

interface Question {
  question: string
  answer: string
}

export default function Game({ params }: { params: { code: string } }) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answer, setAnswer] = useState("")
  const [scores, setScores] = useState<Record<string, number>>({})
  const [gameOver, setGameOver] = useState(false)
  const [waitingForOthers, setWaitingForOthers] = useState(false)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [totalPlayers, setTotalPlayers] = useState(2)
  const [showingAnswer, setShowingAnswer] = useState(false)
  const [correctAnswer, setCorrectAnswer] = useState("")
  const [currentQuestionText, setCurrentQuestionText] = useState("")
  const [readyForNext, setReadyForNext] = useState(false)
  const [readyCount, setReadyCount] = useState(0)
  const searchParams = useSearchParams()
  const playerName = searchParams.get("playerName") || "Unknown Player"
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
    
    channel.bind("score-update", (data: { 
      scores: Record<string, number>;
      playerName: string;
      currentQuestion: number;
      totalAnswered: number;
      totalPlayers: number;
    }) => {
      setScores(prevScores => ({...data.scores}))
      setTotalAnswered(data.totalAnswered)
      setTotalPlayers(data.totalPlayers)
      if (data.playerName === playerName) {
        setWaitingForOthers(true)
      }
    })

    channel.bind("show-answer", (data: {
      scores: Record<string, number>;
      correctAnswer: string;
      question: string;
    }) => {
      setScores(prevScores => ({...data.scores}))
      setShowingAnswer(true)
      setCorrectAnswer(data.correctAnswer)
      setCurrentQuestionText(data.question)
      setWaitingForOthers(false)
      setReadyForNext(false)
      setReadyCount(0)
    })

    channel.bind("next-question", (data: { questionNumber: number; scores: Record<string, number> }) => {
      setCurrentQuestion(data.questionNumber)
      setScores(prevScores => ({...data.scores}))
      setShowingAnswer(false)
      setWaitingForOthers(false)
      setAnswer("")
      setTotalAnswered(0)
      setReadyForNext(false)
      setReadyCount(0)
    })

    channel.bind("game-over", () => {
      setGameOver(true)
    })

    return () => {
      pusher.unsubscribe(`game-${params.code}`)
    }
  }, [params.code, playerName])

  const submitAnswer = async () => {
    if (!answer || waitingForOthers) return

    try {
      const response = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lobbyCode: params.code,
          playerName,
          question: questions[currentQuestion].question,
          correctAnswer: questions[currentQuestion].answer,
          playerAnswer: answer,
        }),
      })
      
      if (!response.ok) {
        console.error("Error submitting answer:", await response.json())
        return
      }

      const data = await response.json()
      if (data.waitingForOthers) {
        setWaitingForOthers(true)
      }
      if (data.showingAnswer) {
        setShowingAnswer(true)
      }
    } catch (error) {
      console.error("Error submitting answer:", error)
    }
  }

  const markReadyForNext = async () => {
    if (readyForNext) return

    try {
      const response = await fetch("/api/submit-answer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lobbyCode: params.code,
          playerName,
        }),
      })
      
      if (!response.ok) {
        console.error("Error marking ready:", await response.json())
        return
      }

      const data = await response.json()
      setReadyForNext(true)
      setReadyCount(data.readyCount)
    } catch (error) {
      console.error("Error marking ready:", error)
    }
  }

  if (gameOver || currentQuestion >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="absolute top-4 right-4 text-gray-600">
          Playing as: <span className="font-bold">{playerName}</span>
        </div>
        <h1 className="text-4xl font-bold mb-8">Game Over!</h1>
        <p className="text-2xl mb-4">Final Scores:</p>
        {Object.entries(scores).map(([player, score]) => (
          <p key={player} className="text-xl mb-2">
            {player}: {score} {player === playerName && "(you)"}
          </p>
        ))}
        <button
          onClick={() => router.push("/")}
          className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Play Again
        </button>
      </div>
    )
  }

  if (showingAnswer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <div className="absolute top-4 right-4 text-gray-600">
          Playing as: <span className="font-bold">{playerName}</span>
        </div>
        <h1 className="text-4xl font-bold mb-8">Answer Revealed!</h1>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1}:</h2>
          <p className="text-xl mb-4">{currentQuestionText}</p>
          <p className="text-2xl mb-4">
            Correct Answer: <span className="font-bold text-green-600">{correctAnswer}</span>
          </p>
          <p className="text-lg text-gray-600 mb-4">
            {readyForNext ? 
              `Waiting for others... (${readyCount}/${totalPlayers} ready)` :
              "Click when you're ready for the next question!"
            }
          </p>
          <button
            onClick={markReadyForNext}
            disabled={readyForNext}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            Ready for Next Question
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Current Scores:</h2>
          {Object.entries(scores).map(([player, score]) => (
            <p key={player} className="text-xl mb-2">
              {player}: {score} {player === playerName && "(you)"}
            </p>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="absolute top-4 right-4 text-gray-600">
        Playing as: <span className="font-bold">{playerName}</span>
      </div>
      <h1 className="text-4xl font-bold mb-8">Trivia Game</h1>
      {questions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Question {currentQuestion + 1}:</h2>
          <p className="text-xl mb-4">{questions[currentQuestion].question}</p>
          {waitingForOthers ? (
            <div className="text-lg text-gray-600 mb-4">
              Waiting for others... ({totalAnswered}/{totalPlayers} players answered)
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your answer"
                className="border-2 border-gray-300 rounded-md p-2"
                disabled={waitingForOthers}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && answer) {
                    submitAnswer()
                  }
                }}
              />
              <button
                onClick={submitAnswer}
                disabled={!answer || waitingForOthers}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Submit Answer
              </button>
            </div>
          )}
        </div>
      )}
      <div>
        <h2 className="text-2xl font-bold mb-4">Scores:</h2>
        {Object.entries(scores).map(([player, score]) => (
          <p key={player} className="text-xl mb-2">
            {player}: {score} {player === playerName && "(you)"}
          </p>
        ))}
      </div>
    </div>
  )
}


