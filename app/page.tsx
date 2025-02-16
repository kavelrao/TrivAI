import Link from "next/link"
import { Titan_One } from 'next/font/google'

const titan = Titan_One({ 
  weight: '400',
  subsets: ['latin'],
})

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 relative overflow-hidden">
      {/* Bouncing shapes */}
      <div className="fixed inset-0 w-screen h-screen pointer-events-none">
        {/* Triangle 1 */}
        <div className="absolute top-10 left-10 w-40 h-40 animate-bounce-1">
          <svg viewBox="0 0 24 24" className="w-full h-full text-pink-400 opacity-60">
            <path fill="currentColor" d="M12 2L2 19h20L12 2z"/>
          </svg>
        </div>
      </div>

      <div className="relative z-10">
        {/* Title section with a fun tilt */}
        <div className="bg-white/90 shadow-xl mx-auto mt-16 max-w-2xl rounded-3xl p-8 backdrop-blur-sm">
          <div className="animate-bounce-gentle">
            <h1 className={`${titan.className} text-8xl text-purple-400 filter drop-shadow-[0_8px_8px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform`}>
              TrivAI
            </h1>
          </div>
          <p className="text-2xl font-medium text-purple-800 mt-4">
            Where AI Makes Trivia Awesome!
          </p>
        </div>

        {/* Quirky buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Link 
            href="/create-game" 
            className="group transition-all"
          >
            <div className="bg-purple-500 rounded-[2rem] p-1">
              <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
                <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
                  Create Game
                </span>
              </div>
            </div>
          </Link>
          <Link 
            href="/join-game" 
            className="group transition-all"
          >
            <div className="bg-purple-500 rounded-[2rem] p-1">
              <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
                <span className="text-xl font-bold text-purple-500 group-hover:text-white transition-all">
                  Join Game
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Fun features section */}
        <div className="mt-20 px-4 flex flex-col sm:flex-row gap-8 justify-center items-center max-w-6xl mx-auto">
          <div className="transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <h3 className="text-xl font-bold text-purple-500">Magic Questions!</h3>
              <p className="text-purple-700 mt-2">AI brews up the perfect trivia just for you!</p>
            </div>
          </div>
          <div className="transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <h3 className="text-xl font-bold text-purple-500">Party Time!</h3>
              <p className="text-purple-700 mt-2">Challenge your friends to epic battles!</p>
            </div>
          </div>
          <div className="transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <h3 className="text-xl font-bold text-purple-500">Your Rules!</h3>
              <p className="text-purple-700 mt-2">Pick any topic under the sun!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


