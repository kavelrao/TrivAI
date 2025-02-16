// In a real app, this would be stored in a database
// Using global to persist data between API route instantiations

export const QUESTIONS_PER_GAME = 5

const globalForGame = global as typeof globalThis & {
  lobbyTopics: Record<string, string[]>
  lobbyPlayers: Record<string, string[]>
  lobbyQuestions: Record<string, Array<{ question: string; answer: string }>>
}

// Initialize global state
if (!globalForGame.lobbyTopics) {
  globalForGame.lobbyTopics = {}
}
if (!globalForGame.lobbyPlayers) {
  globalForGame.lobbyPlayers = {}
}
if (!globalForGame.lobbyQuestions) {
  globalForGame.lobbyQuestions = {}
}

export function getTopics(lobbyCode: string): string[] {
  console.log("getTopics helper called for lobby:", lobbyCode, "Topics:", globalForGame.lobbyTopics[lobbyCode] || [])
  return globalForGame.lobbyTopics[lobbyCode] || []
}

export function addTopic(lobbyCode: string, topic: string) {
  if (!globalForGame.lobbyTopics[lobbyCode]) {
    globalForGame.lobbyTopics[lobbyCode] = []
  }
  globalForGame.lobbyTopics[lobbyCode].push(topic)
}

export function getPlayers(lobbyCode: string): string[] {
  return globalForGame.lobbyPlayers[lobbyCode] || []
}

export function addPlayer(lobbyCode: string, playerName: string) {
  if (!globalForGame.lobbyPlayers[lobbyCode]) {
    globalForGame.lobbyPlayers[lobbyCode] = []
  }
  globalForGame.lobbyPlayers[lobbyCode].push(playerName)
}

export function getQuestions(lobbyCode: string) {
  const questions = globalForGame.lobbyQuestions[lobbyCode] || []
  console.log("Getting questions for lobby:", lobbyCode, "Questions:", questions)
  return questions
} 