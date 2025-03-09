const waitingQueue: string[] = []
const inProgressQueue: string[] = []

function processQueue () {
  if (inProgressQueue.length < 1) {
    const userId: string | undefined = waitingQueue.shift()
    if (userId) {
      console.log(`Allowing entry to ${userId}`)
      inProgressQueue.push(userId)
    }
  }
}

function addToWaitingQueue (userId: string): void {
  if (!isInWaitingQueue(userId)) {
    waitingQueue.push(userId)
  }
}

function isInWaitingQueue (userId: string): boolean {
  return waitingQueue.includes(userId)
}

function countWaitingQueue (): number {
  return waitingQueue.length
}

function getPositionInQueue (userId: string): number {
  return waitingQueue.indexOf(userId) + 1
}

function isInProgress (userId: string): boolean {
  return inProgressQueue.includes(userId)
}

function removeFromInProgressQueue (userId: string): void {
  inProgressQueue.splice(inProgressQueue.indexOf(userId), 1)
  console.log(`Transaction completed for ${userId}`)
}

setInterval(processQueue, 10000)

export {
  removeFromInProgressQueue,
  addToWaitingQueue,
  countWaitingQueue,
  getPositionInQueue,
  isInWaitingQueue,
  isInProgress,
}
