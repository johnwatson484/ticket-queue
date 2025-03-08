const waitingQueue: string[] = []
const inProgressQueue: string[] = []

function processQueue () {
  if (inProgressQueue.length < 1) {
    const queueId: string | undefined = waitingQueue.shift()
    if (queueId) {
      console.log(`Allowing entry to ${queueId}`)
      inProgressQueue.push(queueId)
    }
  }
}

function addToWaitingQueue (queueId: string): void {
  if (!isInWaitingQueue(queueId)) {
    waitingQueue.push(queueId)
  }
}

function isInWaitingQueue (queueId: string): boolean {
  return waitingQueue.includes(queueId)
}

function countWaitingQueue (): number {
  return waitingQueue.length
}

function getPositionInQueue (queueId: string): number {
  return waitingQueue.indexOf(queueId) + 1
}

function isInProgress (queueId: string): boolean {
  return inProgressQueue.includes(queueId)
}

function removeFromInProgressQueue (queueId: string): void {
  inProgressQueue.splice(inProgressQueue.indexOf(queueId), 1)
  console.log(`Transaction completed for ${queueId}`)
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
