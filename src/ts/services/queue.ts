import { client } from '../redis.js'

const WAITING_QUEUE = 'waiting-queue'
const IN_PROGRESS = 'in-progress'
const QUEUE_ITEM_TTL = 60 * 20 // 20 minutes

async function processQueue () {
  const usersInProcess: number = await countInProgress()

  if (usersInProcess < 1) {
    const userId: string | null = await client.lPop(WAITING_QUEUE)

    if (userId) {
      console.log(`Allowing entry to ${userId}`)
      await client.set(`${IN_PROGRESS}:${userId}`, userId)
      await client.expire(`${IN_PROGRESS}:${userId}`, QUEUE_ITEM_TTL)
    }
  }
}

async function countInProgress (): Promise<number> {
  const keys: string[] = await client.keys(`${IN_PROGRESS}:*`)
  return keys.length
}

async function addToWaitingQueue (userId: string): Promise<void> {
  if (!await isInWaitingQueue(userId)) {
    await client.rPush(WAITING_QUEUE, userId)
    await client.expire(WAITING_QUEUE, QUEUE_ITEM_TTL)
  }
}

async function isInWaitingQueue (userId: string): Promise<boolean> {
  const queueContents: string[] = await client.lRange(WAITING_QUEUE, 0, -1)
  return queueContents.includes(userId)
}

async function countWaitingQueue (): Promise<number> {
  return client.lLen(WAITING_QUEUE)
}

async function getPositionInQueue (userId: string): Promise<number> {
  const queueContents: string[] = await client.lRange(WAITING_QUEUE, 0, -1)
  return queueContents.indexOf(userId) + 1
}

async function isInProgress (userId: string): Promise<boolean> {
  const value: number = await client.exists(`${IN_PROGRESS}:${userId}`)
  return value === 1
}

async function removeFromInProgressQueue (userId: string): Promise<void> {
  await client.del(`${IN_PROGRESS}:${userId}`)
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
