import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold mb-8">TrivAI</h1>
        <div className="flex space-x-4">
          <Link href="/create-game" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Create Game
          </Link>
          <Link href="/join-game" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Join Game
          </Link>
        </div>
      </main>
    </div>
  )
}


