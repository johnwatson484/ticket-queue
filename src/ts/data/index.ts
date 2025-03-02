import { MongoClient } from 'mongodb'
import config from '../config.js'

const client: MongoClient = new MongoClient(config.get('mongoUri'))
await client.connect()

const db: any = client.db('ticket-queue')

async function countAvailableTickets () : Promise<number> {
  const collection = db.collection('tickets')
  // reservedDate and confirmedDate are undefined for available tickets
  return collection.countDocuments({ reservedDate: undefined, confirmedDate: undefined })
}

async function createTickets (numberToCreate: number = 5) : Promise<void> {
  const tickets: Ticket[] = Array.from({ length: numberToCreate }, () => ({
    _id: undefined,
    reservedDate: undefined,
    confirmedDate: undefined
  }))

  const collection = db.collection('tickets')
  await collection.insertMany(tickets)
}

async function deleteAllTickets () : Promise<void> {
  const collection = db.collection('tickets')
  await collection.deleteMany({})
}

type Ticket = {
  _id: number | undefined
  reservedDate: Date | undefined
  confirmedDate: Date | undefined
}

export { client, countAvailableTickets, createTickets, deleteAllTickets, Ticket }
