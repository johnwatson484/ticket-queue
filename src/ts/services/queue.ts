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
  waitingQueue.push(queueId)
}

function isInWaitingQueue (queueId: string): boolean {
  return waitingQueue.includes(queueId)
}

function hasBeenProcessed (queueId: string): boolean {
  return processedQueue.includes(queueId)
}

setInterval(processQueue, 5000)

export {
  addToWaitingQueue,
  isInWaitingQueue,
  hasBeenProcessed,
}
