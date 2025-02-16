import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-yellow-50 relative overflow-hidden">
      {/* Fun pattern background */}
      <div className="absolute inset-0" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.343 4-4s-1.343-4-4-4-4 1.343-4 4 1.343 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        backgroundSize: '150px 150px'
      }}></div>

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
        <div className="transform -rotate-2 bg-white/90 shadow-xl mx-auto mt-16 max-w-2xl rounded-3xl p-8 backdrop-blur-sm">
          <div className="animate-bounce-gentle">
            <h1 className="text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 filter drop-shadow-lg transform rotate-2">
              TrivAI
            </h1>
          </div>
          <p className="text-2xl font-medium text-purple-800 mt-4 transform rotate-2">
            Where AI Makes Trivia Awesome!
          </p>
        </div>

        {/* Quirky buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-8 justify-center items-center">
          <Link 
            href="/create-game" 
            className="group transform hover:-rotate-3 transition-all"
          >
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-[2rem] p-1">
              <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
                <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 group-hover:text-white bg-clip-text text-transparent">
                  🎲 Create Game
                </span>
              </div>
            </div>
          </Link>
          <Link 
            href="/join-game" 
            className="group transform hover:rotate-3 transition-all"
          >
            <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-[2rem] p-1">
              <div className="px-10 py-4 rounded-[calc(2rem-2px)] bg-white hover:bg-opacity-0 transition-all">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-purple-500 group-hover:text-white bg-clip-text text-transparent">
                  🤝 Join Game
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Fun features section */}
        <div className="mt-20 px-4 flex flex-col sm:flex-row gap-8 justify-center items-center max-w-6xl mx-auto">
          <div className="transform -rotate-3 hover:rotate-0 transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <div className="text-5xl mb-4 animate-bounce-gentle">🤖</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Magic Questions!</h3>
              <p className="text-purple-700 mt-2">AI brews up the perfect trivia just for you!</p>
            </div>
          </div>
          <div className="transform rotate-3 hover:rotate-0 transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <div className="text-5xl mb-4 animate-bounce-gentle">👥</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-cyan-500 bg-clip-text text-transparent">Party Time!</h3>
              <p className="text-purple-700 mt-2">Challenge your friends to epic battles!</p>
            </div>
          </div>
          <div className="transform -rotate-3 hover:rotate-0 transition-all">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-[3rem] shadow-lg hover:shadow-xl w-72 text-center">
              <div className="text-5xl mb-4 animate-bounce-gentle">🎯</div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent">Your Rules!</h3>
              <p className="text-purple-700 mt-2">Pick any topic under the sun!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


