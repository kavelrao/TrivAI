import './globals.css'

export const metadata = {
  title: 'TrivAI',
  description: 'An AI-powered trivia game experience',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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

          {/* Main content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
