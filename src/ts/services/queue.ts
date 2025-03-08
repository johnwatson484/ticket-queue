const waitingQueue: string[] = []
const processedQueue: string[] = []

function processQueue () {
  const queueId: string | undefined = waitingQueue.shift()
  if (queueId) {
    console.log(`Processing queueId: ${queueId}`)
    processedQueue.push(queueId)
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

function getPositionInQueue
(queueId: string): number {
  return waitingQueue.indexOf(queueId)
}

function hasBeenProcessed (queueId: string): boolean {
  return processedQueue.includes(queueId)
}

setInterval(processQueue, 10000)

export {
  addToWaitingQueue,
  countWaitingQueue,
  getPositionInQueue
  ,
  isInWaitingQueue,
  hasBeenProcessed,
}
