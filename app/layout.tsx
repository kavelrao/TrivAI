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
      <body>{children}</body>
    </html>
  )
}
