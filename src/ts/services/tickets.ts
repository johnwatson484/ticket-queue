import { collection } from '../mongo.js'

const RESERVATION_EXPIRATION = 1 * 60 * 1000

async function countAvailableTickets () : Promise<number> {
  const reserveExpirationDate = new Date(Date.now() - RESERVATION_EXPIRATION).toISOString()
  return collection.countDocuments({
    $or: [
      { reservedDate: undefined },
      { reservedDate: { $lt: reserveExpirationDate } }
    ],
    confirmedDate: undefined
  })
}

async function createTickets (numberToCreate: number = 5) : Promise<void> {
  const tickets: object[] = Array.from({ length: numberToCreate }, () => ({}))
  await collection.insertMany(tickets)
}

async function deleteAllTickets () : Promise<void> {
  await collection.deleteMany({})
}

export {
  countAvailableTickets,
  createTickets,
  deleteAllTickets,
}
